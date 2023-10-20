const WhatsappCell = ({ displayValue }) => {

    let text, url;
    if (displayValue && typeof displayValue === 'string') {
        [text, url] = displayValue.split('#');
    } else {
        text = '';
        url = '';
    }

    return (
        <a
            href={url}
            onClick={event => {event.stopPropagation();}}
        >
            {text}
        </a>
    );
};

export default WhatsappCell;