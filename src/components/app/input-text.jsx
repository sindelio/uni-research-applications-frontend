function InputText(props) {
  let defaultClass =
    'mt-2 mb-6 px-4 py-1 border border-purple-400 rounded-lg focus:outline-purple-600';
  if (props.disabled === true) {
    defaultClass =
      'mt-2 mb-6 px-4 py-1 bg-transparent-100 text-gray-400 border border-gray-300 rounded-lg hover:cursor-default';
  }
  const inputClass = props?.inputClass;
  let renderedClass = defaultClass;
  if (inputClass !== null && inputClass !== undefined) {
    renderedClass = defaultClass.concat(' ', inputClass);
  }
  return (
    <div>
      <p>{props.label}</p>
      <input
        type="text"
        id={props.id}
        name={props.id}
        class={renderedClass}
        placeholder={props.placeholder}
        size={props.size || 64}
        maxlength={props.maxlength || 256}
        required={props.required || false}
        disabled={props.disabled || false}
      />
      <br />
    </div>
  );
}

export default InputText;
