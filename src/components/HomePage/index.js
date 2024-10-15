import styles from './styles.module.css'
import {categories} from "../../config/constants";
import CategoryCard from "../CategoryCard";

export default function HomePage() {
  return (
      <div className="container">
          <div className={styles.content}>
              { categories.map((category, index) => (
                  <CategoryCard category={category} key={index} />
              ))}
          </div>
      </div>
  );
}
