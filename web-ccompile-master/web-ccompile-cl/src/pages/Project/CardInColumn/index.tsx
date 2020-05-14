import React from 'react';
import { Card, Col, Typography, Row } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { Services } from '@/services';
import styles from './index.less';

const { Text } = Typography;

export interface Props {
  dataSource: Services.ProjectAllList;
}

export default (props: Props) => {
  return (
    <div className={styles.container}>
      <div id="components-card-demo-in-column">
        <div className="site-card-wrapper">
          <Row gutter={16}>
            {props.dataSource.map(item => {
              return (
                <Col span={8} key={item.id}>
                  <Card
                    title={item.name}
                    bordered={false}
                    hoverable
                    onClick={() => {
                      history.push(`/edit?id=${item.id}`);
                    }}
                  >
                    <Text style={{ width: '100%' }} ellipsis>
                      项目介绍：{item.desc}
                    </Text>

                    <Text style={{ width: '100%' }} ellipsis>
                      <FileOutlined /> {item.files.length}
                    </Text>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>
      </div>
    </div>
  );
};
