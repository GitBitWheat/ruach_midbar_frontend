/**
 * Custom cell of DataGrid. Displays a link.
 * @param {Object} props The properties of the component.
 *      - value (Object): The value object of the cell.
 * @param {String} props.value
 */
const LinkCell = ({ value }) => {

    let text, url;
    if (value) {
        [text, url] = value.split('#');
    } else {
        text = '';
        url = '';
    }

    return (
        <a
            href={url}
            onClick={event => {event.stopPropagation();}}
            target='_blank'
            rel='noreferrer'
        >
            {text}
        </a>
    );
};

export default LinkCell;