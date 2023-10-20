import { range } from "../../utils/arrayUtils";

import './indexlist.css';



const IndexList = ({start, end, selected, selectedChangeHandler}) => {
    return (
        <p className="indexList">
            {[...range(start, end)].map(i => (
                <span
                    key={i}
                    onClick={selectedChangeHandler(i)}
                    className={i === selected ? "selectedIdx" : "notSelectedIdx"}
                >
                    {i}
                </span>
            ))}
        </p>
    );
};



export default IndexList;