function Button(props) {
  let defaultClass =
    'mt-2 mb-6 px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-purple-600 hover:text-white hover:cursor-pointer focus:outline-purple-600';
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
    <button
      type={props.type || 'button'}
      id={props.id}
      name={props.id}
      class={renderedClass}
    >
      {props.children}
    </button>
  );
}

export default Button;
