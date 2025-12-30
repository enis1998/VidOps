import { Link } from "react-router-dom";

export function Brand({ to = "/" }: { to?: string }) {
    return (
        <Link className="brand" to={to}>
            <div className="brandMark" aria-hidden="true">
                AI
            </div>
            <div className="brandText">
                <div className="name">aiboxio</div>
                <div className="tag">Prompt → Video → Publish</div>
            </div>
        </Link>
    );
}
