function OutsideImage(_props) {
  return (
    <div class="col-start-2 col-span-1 invisible md:visible mx-auto my-auto">
      <img
        id="cells"
        src="/images/cells.png"
        alt="Cells"
        title="Trabalho premiado no último evento"
        class="w-72 h-54 border-2 border-purple-300 rounded-3xl"
      />
    </div>
  );
}

export default OutsideImage;
