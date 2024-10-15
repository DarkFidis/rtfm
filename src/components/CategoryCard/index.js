import styles from './style.module.css';
import ThemeCard from "../ThemeCard";
export default function CategoryCard({ category }) {
    return (
        <div className={styles.category}>
            <h2>{category.title}</h2>
            <div className={styles.items}>
                { category.items.map((item, index) => (
                    <ThemeCard {...item} key={index} />
                ))}
            </div>
        </div>
    )
}