/**
 * Custom cell of DataGrid. Displays a link.
 * @param {Object} props The properties of the component.
 *      - value (Object): The value object of the cell.
 * @param {Object} props.value The value object of the cell.
 *      - 'link' (string): Link string of the cell: '\<text\>#\<url\>'
 *      - 'text' (string): Text of the link. Used if link isn't used.
 *      - 'url' (string): URL of the link. Used if link isn't used.
 *      - 'newTab' (boolean): Whether the link opens in a new tab or not
 * @param {string} props.value.link
 * @param {string} props.value.text
 * @param {string} props.value.url
 * @param {boolean} props.value.newTab
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