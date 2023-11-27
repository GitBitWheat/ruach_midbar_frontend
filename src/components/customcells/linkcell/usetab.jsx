/**
 * @param {import('react').RefObject<import('devextreme-react/text-box').TextBox>} textRef 
 * @param {import('react').RefObject<import('devextreme-react/text-box').TextBox>} linkRef 
 */
const useTab = (textRef, linkRef) => {

    /** @param {import('devextreme/ui/text_box').KeyDownEvent} event */
    const onTextTabKey = event => {
        if (event.event.key === 'Tab' && linkRef && linkRef.current) {
            event.event.preventDefault();
            event.component.blur();
            const linkTextBox = linkRef.current;
            linkTextBox.instance.focus();
        }
    };

    /** @param {import('devextreme/ui/text_box').KeyDownEvent} event */
    const onLinkTabKey = event => {
        if (event.event.key === 'Tab' && textRef && textRef.current) {
            event.event.preventDefault();
            event.component.blur();
            const textTextBox = textRef.current;
            textTextBox.instance.focus();
        }
    };

    return [onTextTabKey, onLinkTabKey];
};

export default useTab;