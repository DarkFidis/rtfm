import styles from './styles.module.css';

export default function Banner({ children }) {
    return (
        <div className={styles.banner}>{ children }</div>
    );
}