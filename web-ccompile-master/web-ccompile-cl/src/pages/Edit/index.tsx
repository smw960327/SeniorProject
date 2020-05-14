import * as React from 'react';
import { Layout, Card, Tabs, Input, Form, Button, message, Modal } from 'antd';
import { TabsProps } from 'antd/lib/tabs';
import { SettingFilled, PlayCircleFilled, SaveFilled, FileAddFilled } from '@ant-design/icons';
import { TextAreaProps } from 'antd/lib/input';
import { useList, useAsyncFn, useMount } from 'react-use';
import { IRouteComponentProps, history } from 'umi';
import { Services } from '@/services';
import TreeDirectory from './TreeDirectory';

interface IEditProps extends IRouteComponentProps {}

const { TabPane } = Tabs;
const { Footer, Sider, Content } = Layout;

const { TextArea } = Input;
const FormItem = Form.Item;

type PaneValue = {
  title: string;
  content: string;
  key: string;
  path: string;
  id?: number;
};

const Edit: React.FunctionComponent<IEditProps> = props => {
  const { location } = props;
  const [activeKey, setActiveKey] = React.useState<string | undefined>('1');
  const [panesData, PanesDataActions] = useList<PaneValue>();
  const [footerInfo, setFooterInfo] = React.useState('');

  const { query } = location;
  const { id: projectId } = query as any;
  const [form] = Form.useForm();

  const [projectInfoState, getInfo] = useAsyncFn(async () => {
    const res = await Services.Project.info(Number(projectId));
    if (res.data.status === 1) {
      return res.data.data;
    }
    return undefined;
  }, [projectId]);

  const [saveState, saveFile] = useAsyncFn(
    async (params?: Omit<PaneValue, 'key' | 'path'>) => {
      if (params) {
        const { id } = params;
        if (!id) {
          const res = await Services.File.add({
            projectId: Number(projectId),
            content: params.content,
            name: params.title,
          });
          if (res.data.status === 1) {
            message.success(`${params.title} 保存成功`);
            return res.data.data;
          }
          message.error(`${params.title} 保存失败`);
          return undefined;
        }
        const res = await Services.File.update({
          id,
          content: params.content,
        });
        if (res.data.status === 1) {
          message.success(`${params.title} 保存成功`);
          return res.data.data;
        }
        message.error(`${params.title} 保存失败`);
      }
      return undefined;
    },
    [projectId],
  );
  const [runState, codeRun] = useAsyncFn(async (content?: string) => {
    const res = await Services.File.run(content as string);
    return res.data.message;
  });
  const [compileState, codeCompile] = useAsyncFn(async (content?: string) => {
    const res = await Services.File.compile(content as string);
    return res.data.message;
  });

  const [visible, setVisible] = React.useState(false);

  const openModal = () => {
    setVisible(true);
  };
  const closeModal = () => {
    setVisible(false);
  };

  const getFileContent = async (path: string) => {
    const res = await Services.File.info(path);
    if (res.data.status === 1) {
      return res.data.data as string;
    }
    return '';
  };

  useMount(async () => {
    if (!projectId) {
      history.push('/project');
      return;
    }
    const info = await getInfo();
    if (info && info.files && info.files.length > 0) {
      const newPanesData = info.files.map(item => {
        return {
          title: item.name,
          content: '',
          key: `${item.id}`,
          path: item.path,
          id: item.id,
        };
      });
      const activePane = newPanesData[0];
      const activePath = activePane.path;
      const newActivekey = activePane.key;
      const activeContent = await getFileContent(activePath);
      newPanesData[0].content = activeContent;
      PanesDataActions.set(newPanesData);
      setActiveKey(newActivekey);
    }
  });

  const handleChange = (key: string) => {
    return (e => {
      const newPanes = panesData.map(item => {
        if (item.key === key) {
          return {
            ...item,
            content: e.target.value,
          };
        }
        return {
          ...item,
        };
      });
      PanesDataActions.set(newPanes);
    }) as TextAreaProps['onChange'];
  };

  const getTabContent = () => {
    return panesData.map(item => {
      return (
        <TabPane key={item.key} tab={item.title}>
          <TextArea
            style={{ height: '500px' }}
            value={item.content}
            onChange={handleChange(item.key)}
          />
        </TabPane>
      );
    });
  };

  const handleEdit: TabsProps['onEdit'] = (key, action) => {
    if (action === 'remove') {
      const removePane = panesData.find(item => item.key === key);
      const newPanes = panesData.filter(item => item.key !== key);
      if (removePane?.key === activeKey) {
        setActiveKey(newPanes[0] ? newPanes[0].key : undefined);
      }
      PanesDataActions.set(newPanes);
    }
  };

  const handleSave = () => {
    const ActivePane = panesData.find(item => item.key === activeKey);
    if (ActivePane) {
      saveFile(ActivePane);
    }
  };

  const handleAdd = () => {
    form.validateFields().then(store => {
      const { filename } = store;
      const newPane = {
        title: filename,
        content: '',
      };
      saveFile(newPane).then(res => {
        getInfo();
        PanesDataActions.push({
          ...newPane,
          key: `${res.id}`,
          id: res.id,
          path: res.path,
        });
        closeModal();
      });
    });
  };

  const handleTabChange = async (key: string) => {
    setActiveKey(key);
    const activePane = panesData.find(item => item.key === key);
    if (activePane) {
      const activeContent = await getFileContent(activePane.path);
      const newPanesData = panesData.map(item => {
        if (item.key === key) {
          return {
            ...item,
            content: activeContent,
          };
        }
        return {
          ...item,
        };
      });
      PanesDataActions.set(newPanesData);
      return;
    }
    if (projectInfoState.value) {
      if (projectInfoState.value.files) {
        const findFile = projectInfoState.value.files.find(item => `${item.id}` === key);
        if (findFile) {
          const newPaneData: PaneValue = {
            title: findFile.name,
            content: '',
            key: `${findFile.id}`,
            id: findFile.id,
            path: findFile.path,
          };
          const content = await getFileContent(findFile.path);
          newPaneData.content = content;
          PanesDataActions.push(newPaneData);
        }
      }
    }
  };

  const handleRun = () => {
    const ActivePane = panesData.find(item => item.key === activeKey);
    if (ActivePane?.content) {
      codeRun(ActivePane.content)
        .then(res => {
          setFooterInfo(res);
        })
        .catch(err => {
          setFooterInfo(err);
        });
    }
  };
  const handleCompile = () => {
    const ActivePane = panesData.find(item => item.key === activeKey);
    if (ActivePane?.content) {
      codeCompile(ActivePane.content)
        .then(res => {
          setFooterInfo(res);
        })
        .catch(err => {
          setFooterInfo(err);
        });
    }
  };

  return (
    <Layout
      style={{
        margin: '-24px -74px 0 -74px',
      }}
    >
      <Sider theme="light">
        <TreeDirectory
          activeKey={activeKey}
          onChangeActiveKey={handleTabChange}
          datasource={projectInfoState.value}
        />
      </Sider>
      <Layout>
        <Content
          style={{
            padding: '0 2px',
          }}
        >
          <Modal title="添加文件" visible={visible} onCancel={closeModal} onOk={handleAdd}>
            <Form form={form}>
              <FormItem
                name="filename"
                label="文件名"
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input />
              </FormItem>
            </Form>
          </Modal>
          <div style={{ padding: '5px 0', backgroundColor: '#fff', margin: '2px 0' }}>
            <Button style={{ marginRight: '15px' }} onClick={openModal}>
              <FileAddFilled />
              Add
            </Button>
            <Button
              style={{ marginRight: '15px' }}
              loading={saveState.loading}
              onClick={handleSave}
            >
              <SaveFilled />
              Save
            </Button>
            <Button style={{ marginRight: '15px' }} loading={runState.loading} onClick={handleRun}>
              <SettingFilled />
              Run
            </Button>
            <Button onClick={handleCompile} loading={compileState.loading}>
              <PlayCircleFilled />
              Compile
            </Button>
          </div>
          <Card bodyStyle={{ padding: '0' }}>
            <Tabs
              type="editable-card"
              activeKey={activeKey}
              onChange={handleTabChange}
              onEdit={handleEdit}
            >
              {getTabContent()}
            </Tabs>
          </Card>
        </Content>
        <Footer style={{ padding: '0 2px' }}>
          <Card
            bodyStyle={{
              padding: '6px 24px',
              height: '150px',
            }}
          >
            {footerInfo}
          </Card>
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Edit;
