function Anchor(props) {
  let defaultClass =
    'm-2 px-4 py-1 text-purple-600 border border-purple-400 rounded-lg hover:bg-purple-600 hover:text-white focus:outline-purple-600 hover:cursor-pointer';
  if (props.disabled === true) {
    defaultClass =
      'm-2 px-4 py-1 bg-transparent-100 text-gray-400 border border-gray-300 rounded-lg';
  }
  const inputClass = props?.inputClass;
  let renderedClass = defaultClass;
  if (inputClass !== null && inputClass !== undefined) {
    renderedClass = defaultClass.concat(' ', inputClass);
  }
  return (
    <a
      href={props.href}
      target={props.target}
      id={props.id}
      name={props.id}
      class={renderedClass}
      download={props.download}
    >
      {props.children}
    </a>
  );
}

export default Anchor;
