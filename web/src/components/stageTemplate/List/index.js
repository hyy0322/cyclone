import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import qs from 'query-string';
import { Layout, Button } from 'antd';

import Item from './Item';
import KindFilter from './KindFilter';
import styles from './list.module.less';

const { Content, Header, Sider } = Layout;

@inject('stageTemplate')
@observer
class StageTemplate extends React.Component {
  componentDidMount() {
    this.props.stageTemplate.getTemplateList();
  }

  getKinds = list => {
    const kinds = ['all'];
    _.forEach(list, item => {
      const kind = _.get(item, [
        'metadata',
        'labels',
        'stage.cyclone.dev/template-kind',
      ]);
      kind && !kinds.includes(kind) && kinds.push(kind);
    });
    return _.map(kinds, kind => ({
      alias: intl.get(`template.kinds.${kind}`) || kind,
      value: kind === 'all' ? '' : kind,
    }));
  };

  filterByKind = (list, kind) => {
    return !kind
      ? list
      : _.filter(list, item => {
          return (
            kind ===
            _.get(item, [
              'metadata',
              'labels',
              'stage.cyclone.dev/template-kind',
            ])
          );
        });
  };

  addStageTemplate = () => {
    this.props.history.push('/stageTemplate/add');
  };

  render() {
    const {
      location = {},
      stageTemplate: { templateList = [] },
      history,
    } = this.props;
    const kinds = this.getKinds(templateList.items);
    // get kind from querystring
    const query = qs.parse(location.search);
    const actualList = this.filterByKind(templateList.items, query.kind);
    return (
      <Layout style={{ background: 'transparent' }}>
        <Header style={{ background: 'transparent', padding: 0 }} />
        <Sider
          width="160px"
          style={{
            background: 'transparent',
            overflow: 'auto',
          }}
        >
          <KindFilter activeKind={query.kind || ''} kinds={kinds} />
        </Sider>
        <Content>
          <div className="head-bar">
            <Button type="primary" onClick={this.addStageTemplate}>
              {intl.get('operation.add')}
            </Button>
          </div>
          <div className={styles['template-list']}>
            {_.map(actualList, template => (
              <Item
                history={history}
                template={template}
                key={_.get(template, 'metadata.name')}
              />
            ))}
          </div>
        </Content>
      </Layout>
    );
  }
}

StageTemplate.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }),
  stageTemplate: PropTypes.object,
  history: PropTypes.object,
};

export default StageTemplate;
