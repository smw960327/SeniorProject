import React from 'react';
import styles from './index.less';
import LayoutFixed from './LayoutFixed';
export default () => {
  return (
    <div>
      <LayoutFixed />
      <h1 className={styles.title}>Page index</h1>
    </div>
  );
};
