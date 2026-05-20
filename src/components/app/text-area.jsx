function TextArea(props) {
  let defaultClass =
    'mt-2 mb-6 p-4 border border-purple-400 rounded-lg focus:outline-purple-600';
  if (props.disabled === true) {
    defaultClass =
      'mt-2 mb-6 p-4 bg-transparent-100 text-gray-400 border border-gray-300 rounded-lg';
  }
  const inputClass = props?.inputClass;
  let renderedClass = defaultClass;
  if (inputClass !== null && inputClass !== undefined) {
    renderedClass = defaultClass.concat(' ', inputClass);
  }
  return (
    <div>
      <p>{props.label}</p>
      <textarea
        id={props.id || 'textArea'}
        name={props.id}
        class={renderedClass}
        disabled={props.disabled}
        placeholder={props.placeholder}
        rows={props.rows || 4}
        cols={props.cols || 32}
        maxlength={props.maxlength || 512}
        style={{ resize: 'none' }}
      ></textarea>
    </div>
  );
}

export default TextArea;
