import { useId, useState, type FormEvent } from 'react';

import type { AirportFilterProps } from './types';
import { airportFilterStyles } from './styles';

function AirportFilter({ onApply }: AirportFilterProps) {
	const [value, setValue] = useState('');
	const inputId = useId();

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		onApply(value.trim().toUpperCase());
	}

	function handleClear() {
		setValue('');
		onApply('');
	}

	return (
		<form
			className={airportFilterStyles.form}
			onSubmit={handleSubmit}
		>
			<div className={airportFilterStyles.field}>
				<label
					className={airportFilterStyles.label}
					htmlFor={inputId}
				>
					Airport code
				</label>

				<input
					id={inputId}
					name="airportCode"
					type="text"
					className={airportFilterStyles.input}
					value={value}
					onChange={(event) => setValue(event.target.value)}
					placeholder="e.g. GRU"
					maxLength={3}
					pattern="[A-Za-z]{3}"
					title="Enter three letters or leave blank to show all airports."
				/>
			</div>

			<button
				className={airportFilterStyles.submitButton}
				type="submit"
			>
				Filter
			</button>

			<button
				className={airportFilterStyles.clearButton}
				type="button"
				onClick={handleClear}
			>
				Clear
			</button>
		</form>
	);
}

export { AirportFilter };
