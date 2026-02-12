
epoxrt function notes(content, num) {
  num = String(num);

  console.log(content)

  let boxStyle = {
    position: "relative",
    width: content.props.style.width,
    height: content.props.style.height,
    'text-align':'center',
    'font-family': 'sans-serif'
  };

  let notesStyle = {
    position: "static",
    padding: "7px 10px",
    "background-color": "red",
    color: "white",
    "font-weight": "600",
    margin: "5px 0px",
    display: "inline-block",
    "border-radius": "50%",
    'text-align':'center'
  };

  if (num.length > 2) notesStyle['border-radius'] = '42%'

  let note_container_Style = {
    position: "absolute",
    right: "-50px",
    top: "-20px",
    width: "100px",
    height: "40px",
    display: "block"
  };
  let note = <div style={notesStyle}>{num}</div>;
  let note_container = <div style={note_container_Style}>{note}</div>;
  let box = (
    <div style={boxStyle}>
      {note_container}
      {content}
    </div>
  );
  return box;
}
