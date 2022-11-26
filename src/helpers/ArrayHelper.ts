export const ArrayHelper = (() => {
	function clone(array: any[]): any[] {
		return array.map((value: any) => {
			if (Array.isArray(value)) {
				return ArrayHelper.clone(value);
			}

			return value;
		});
	}

	return {
		clone,
	}
})();
