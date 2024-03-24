import styles from './styles.module.css';

export default function ThemeCard({ href, imgUrl, title }) {
    return (
        <a href={`/docs/${href}`}>
            <div className={styles.card}>
                <img src={`/img/${imgUrl}`} alt="Logo"/>
                <div className={styles.cardbody}>
                    <p>{ title }</p>
                </div>
            </div>
        </a>
    );
}