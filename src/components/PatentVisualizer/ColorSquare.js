const ColorSquare = (props) => (
    <div style={{
        position: 'absolute',
        left: 20,
        top: 10,
        height: 20,
        width: 20,
        clear: 'both',
        backgroundColor: props.color || 'green' 
    }}/>
);

export default ColorSquare;