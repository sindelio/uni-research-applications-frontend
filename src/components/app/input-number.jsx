function InputNumber(props) {
  let defaultClass =
    'mt-2 mb-6 py-1 text-center border border-purple-400 rounded-lg focus:outline-purple-600';
  const inputClass = props?.inputClass;
  let renderedClass = defaultClass;
  if (inputClass !== null && inputClass !== undefined) {
    renderedClass = defaultClass.concat(' ', inputClass);
  }
  return (
    <input
      type="number"
      id={props.id}
      name={props.id}
      min={props.min || 1}
      max={props.max || 999}
      step={props.step || 1}
      maxLength={props.maxLength || 3}
      class={renderedClass}
      onChange={(event) => {
        if (!/[0-9]/.test(event.key)) {
          event.preventDefault();
        }
      }}
    />
  );
}

export default InputNumber;
