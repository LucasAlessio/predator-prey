import { PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form"

export const ConfigurationProvider = ({ children }: PropsWithChildren) => {
	const form = useForm({
		defaultValues: {
			amountPredators: 30,
			amountPreys: 1,
			isPlaying: false,
		}
	});

	return (
		<FormProvider {...form}>
			{children}
		</FormProvider>
	);
}
