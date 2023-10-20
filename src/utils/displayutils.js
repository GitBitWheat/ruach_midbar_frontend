// Display a link with a <a> component
const linkToA = (strWithLink, newTab=true) => {
    const newTabProps = {};
    if (newTab) {
        newTabProps.target = '_blank';
        newTabProps.rel = 'noreferrer';
    }

    return (
        <>
            {strWithLink ? (
                <a
                    href={strWithLink.split('#')[1]}
                    onClick={e => {e.stopPropagation();}}
                    {...newTabProps}
                >
                    {strWithLink.split('#')[0]}
                </a>
            ) : null}
        </>
    );
};

export { linkToA };