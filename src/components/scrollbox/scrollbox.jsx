import './ScrollBox.css'; // Import the CSS file for styling

function ScrollBox({ children }) {
    return (
        <div className="scroll-box">
            {children}
        </div>
    );
}

export default ScrollBox;