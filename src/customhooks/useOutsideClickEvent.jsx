import { useEffect } from "react";

const useOutsideClickEvent = (refs, onClick) => {
    useEffect(() => {
        function handleClickOutside(e) {
            if (refs.every(ref => ref.current && !ref.current.contains(e.target))) {
                onClick();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [refs, onClick]);
};

export default useOutsideClickEvent;