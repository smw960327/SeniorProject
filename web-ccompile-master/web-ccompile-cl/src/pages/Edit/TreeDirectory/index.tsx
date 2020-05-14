import React from 'react';
import { Tree } from 'antd';
import { Services } from '@/services';
import { DirectoryTreeProps } from 'antd/lib/tree';
import styles from './index.less';

const { DirectoryTree } = Tree;

interface TreeData {
  title: string;
  key: string;
  children?: TreeData[];
  isLeaf?: boolean;
}

interface Props {
  datasource: Services.ProjectObject | undefined;
  activeKey: string | undefined;
  onChangeActiveKey: (key: string) => void;
}

export default (props: Props) => {
  const { datasource = {} as Services.ProjectObject, activeKey, onChangeActiveKey } = props;
  const { files } = datasource;

  const treeData: TreeData[] = [
    {
      title: datasource.name,
      key: '0-0',
      children: files
        ? files.map(item => {
            return {
              title: item.name,
              key: `${item.id}`,
              isLeaf: true,
            };
          })
        : [],
    },
  ];

  const onSelect: DirectoryTreeProps['onSelect'] = keys => {
    onChangeActiveKey(keys[0] as string);
  };

  const onExpand = () => {
    console.log('Trigger Expand');
  };

  return (
    <div className={styles.container}>
      <div id="components-tree-demo-directory">
        <DirectoryTree
          multiple
          defaultExpandAll
          selectedKeys={activeKey ? [activeKey] : []}
          onSelect={onSelect}
          onExpand={onExpand}
          treeData={treeData}
        />
      </div>
    </div>
  );
};
