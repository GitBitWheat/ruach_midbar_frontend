/**
 * @param {import('react').RefObject<import('devextreme-react/text-box').TextBox>} linkRef 
 */
const useTab = linkRef => {

    /** @param {import('devextreme/ui/text_box').KeyDownEvent} event */
    const onTextTabKey = event => {
        if (event.event.key === 'Tab' && linkRef && linkRef.current) {
            event.event.preventDefault();
            event.component.blur();
            const linkTextBox = linkRef.current;
            linkTextBox.instance.focus();
        }
    };

    return onTextTabKey;
};

export default useTab;