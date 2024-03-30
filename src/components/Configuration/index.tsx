import { useFormContext } from "react-hook-form"

export const Configuration = () => {
	const { register, setValue, watch } = useFormContext();

	const isPlaying = watch("isPlaying");
	
	const togglePlay = () => {
		setValue("isPlaying", !isPlaying);
	}

	return (
		<>
			<label htmlFor="preys_amount">Preys amount:</label>
			<input {...register("amountPreys", { disabled: isPlaying })} id="preys_amount" />

			<label htmlFor="predators_amount">Predators amount:</label>
			<input {...register("amountPredators", { disabled: isPlaying })} id="predators_amount" />

			<button type="button" onClick={(_) => togglePlay()}>{ isPlaying ? "Pause" : "Play" }</button>
		</>
	)
}
