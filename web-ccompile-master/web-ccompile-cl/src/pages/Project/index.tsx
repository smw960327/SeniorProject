import * as React from 'react';
import { Card, Button, Modal, Form, Input, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Session } from '@/services/session';
import { Services } from '@/services';
import { history } from 'umi';
import { useAsyncFn } from 'react-use';
import CardInColumn from './CardInColumn';

interface IProjectProps {}

const FormItem = Form.Item;

const Project: React.FunctionComponent<IProjectProps> = () => {
  const [projects, getProjects] = useAsyncFn(async () => {
    const user = Session.getUserInfo();
    if (user) {
      const res = await Services.Project.all(user.username);
      if (res.data.status === 1) {
        return res.data.data;
      }
    } else {
      history.push('/login');
    }
    return undefined;
  });

  const [addState, addProject] = useAsyncFn(async (params?: Services.ProjectAddParams) => {
    if (params) {
      const res = await Services.Project.add(params);
      if (res.data.status === 1) {
        getProjects();
        message.success('项目添加成功');
        return res.data;
      }
    }
    message.error('项目添加失败');
    return undefined;
  });

  const [form] = Form.useForm();

  const [visible, setVisible] = React.useState(false);

  const openModal = () => {
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
    if (form) form.resetFields();
  };

  React.useEffect(() => {
    getProjects();
  }, []);

  const handleOk = () => {
    form.validateFields().then(value => {
      const user = Session.getUserInfo();
      if (user) {
        addProject({
          ...value,
          autherId: user.id,
        } as Services.ProjectAddParams).then(() => {
          closeModal();
        });
      } else {
        history.push('/login');
      }
    });
  };

  return (
    <div>
      <Card
        title="项目列表"
        extra={
          <Button type="primary" onClick={openModal} loading={addState.loading}>
            <PlusOutlined />
            添加
          </Button>
        }
        bodyStyle={{
          backgroundColor: '#f0f2f5',
          padding: 0,
          paddingTop: '15px',
        }}
      >
        <CardInColumn dataSource={projects.value || []} />
        <Modal visible={visible} title="添加项目" onCancel={closeModal} onOk={handleOk}>
          <Form form={form}>
            <FormItem
              label="项目名称"
              name="name"
              rules={[
                {
                  required: true,
                  message: '请输入项目名称',
                },
              ]}
            >
              <Input />
            </FormItem>
            <FormItem name="desc" label="项目介绍">
              <Input />
            </FormItem>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default Project;
