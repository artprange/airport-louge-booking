import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BookingService } from '../dist/services/booking.service.js';
import { Prisma } from '../dist/generated/prisma/client.js';
import { CapacityExceededError } from '../dist/errors/capacity-exceeded.error.js';
import { InvalidBookingDateError } from '../dist/errors/invalid-booking-date.error.js';
import { LoungeNotFoundError } from '../dist/errors/lounge-not-found.error.js';
import { BookingConflictError } from '../dist/errors/booking-conflict.error.js';

const loungeId = '11111111-1111-4111-8111-111111111111';
const input = {
  loungeId,
  customerName: 'Arthur',
  guests: 2,
  bookingDate: new Date('2099-12-20T00:00:00.000Z'),
};

function adapterConflict(originalCode) {
  const error = new Error('TransactionWriteConflict');
  error.name = 'DriverAdapterError';
  error.cause = { kind: 'TransactionWriteConflict', originalCode };
  return error;
}

describe('BookingService', () => {
  let bookings;
  let lounges;
  let prisma;
  let service;
  let createdBooking;
  const tx = {};

  beforeEach(() => {
    createdBooking = { ...input, id: 'booking-id', createdAt: new Date() };
    bookings = {
      occupiedCapacity: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(createdBooking),
    };
    lounges = {
      findById: jest.fn().mockResolvedValue({ id: loungeId, capacity: 10 }),
    };
    // Executa o callback sem conexão real; não simula isolamento do banco.
    prisma = { $transaction: jest.fn(async (callback) => callback(tx)) };
    service = new BookingService(bookings, lounges, prisma);
  });

  it('creates a booking using the same Serializable transaction', async () => {
    await expect(service.create(input)).resolves.toEqual(createdBooking);
    expect(lounges.findById).toHaveBeenCalledWith(loungeId, tx);
    expect(bookings.occupiedCapacity).toHaveBeenCalledWith(tx, loungeId, input.bookingDate);
    expect(bookings.create).toHaveBeenCalledWith(tx, input);
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  });

  it('allows exactly filling the available capacity', async () => {
    bookings.occupiedCapacity.mockResolvedValue(8);
    await expect(service.create(input)).resolves.toEqual(createdBooking);
  });

  it('rejects excess capacity without inserting or retrying', async () => {
    bookings.occupiedCapacity.mockResolvedValue(9);
    await expect(service.create(input)).rejects.toBeInstanceOf(CapacityExceededError);
    expect(bookings.create).not.toHaveBeenCalled();
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });

  it('rejects a missing lounge without checking occupancy or inserting', async () => {
    lounges.findById.mockResolvedValue(null);
    await expect(service.create(input)).rejects.toBeInstanceOf(LoungeNotFoundError);
    expect(bookings.occupiedCapacity).not.toHaveBeenCalled();
    expect(bookings.create).not.toHaveBeenCalled();
  });

  it('rejects a past date before opening a transaction', async () => {
    await expect(service.create({
      ...input, bookingDate: new Date('2000-01-01T00:00:00.000Z'),
    })).rejects.toBeInstanceOf(InvalidBookingDateError);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('accepts today according to the UTC convention', async () => {
    // Congelamos o relógio para não depender de uma virada de dia durante o teste.
    jest.useFakeTimers();
    try {
      jest.setSystemTime(new Date('2026-10-15T23:59:00.000Z'));
      await expect(service.create({
        ...input, bookingDate: new Date('2026-10-15T00:00:00.000Z'),
      })).resolves.toEqual(createdBooking);
    } finally {
      jest.useRealTimers();
    }
  });

  it.each([
    ['P2034', new Prisma.PrismaClientKnownRequestError('Write conflict', {
      code: 'P2034', clientVersion: '7.10.0',
    })],
    ['adapter serialization failure', adapterConflict('40001')],
    ['adapter deadlock', adapterConflict('40P01')],
  ])('retries a %s conflict', async (_label, conflict) => {
    prisma.$transaction.mockRejectedValueOnce(conflict);
    await expect(service.create(input)).resolves.toEqual(createdBooking);
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
  });

  it('recalculates occupancy after a conflict at commit', async () => {
    prisma.$transaction.mockImplementationOnce(async (callback) => {
      await callback(tx);
      // O banco real reverteria a primeira tentativa neste ponto.
      throw adapterConflict('40001');
    });
    bookings.occupiedCapacity.mockResolvedValueOnce(0).mockResolvedValueOnce(9);
    await expect(service.create(input)).rejects.toBeInstanceOf(CapacityExceededError);
    expect(prisma.$transaction).toHaveBeenCalledTimes(2);
    expect(bookings.occupiedCapacity).toHaveBeenCalledTimes(2);
    expect(bookings.create).toHaveBeenCalledTimes(1);
  });

  it('stops after three conflicting attempts', async () => {
    prisma.$transaction.mockRejectedValue(adapterConflict('40001'));
    await expect(service.create(input)).rejects.toBeInstanceOf(BookingConflictError);
    expect(prisma.$transaction).toHaveBeenCalledTimes(3);
  });

  it('does not retry unexpected failures', async () => {
    const failure = new Error('Unexpected database failure');
    prisma.$transaction.mockRejectedValue(failure);
    await expect(service.create(input)).rejects.toBe(failure);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
