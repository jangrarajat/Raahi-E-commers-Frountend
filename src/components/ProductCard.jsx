import { Link } from "react-router-dom";

function ProductCard({ product }) {
    return (
        <Link to={`/product/${product._id}`}>
            <div className="border p-4 rounded">
                <img src={product.imageUrl} alt={product.name} />
                <h2>{product.name}</h2>
                <p>₹{product.price}</p>
            </div>
        </Link>
    );
}

export default ProductCard;
