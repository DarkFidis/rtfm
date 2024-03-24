import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomePage from '@site/src/components/HomePage';

import styles from './index.module.css';
import Banner from "../components/Banner";

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Please read the fucking manuel">
      <main>
        <Banner>
            <HomePage />
        </Banner>
      </main>
    </Layout>
  );
}
