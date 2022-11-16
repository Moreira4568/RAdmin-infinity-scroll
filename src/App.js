import React, { Component } from "react";
import { connect } from "react-redux";

import { Admin, Resource, crudGetList, Title, ListBase } from "react-admin";
// import { useRecordContext } from 'react-admin';
import InfiniteScroll from "react-infinite-scroller";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import jsonServerProvider from "ra-data-json-server";
import { makeStyles } from "@material-ui/core/styles";
import LaunchIcon from "@material-ui/icons/Launch";

const dataProvider = jsonServerProvider("https://jsonplaceholder.typicode.com");

class DataView extends Component {
  page = 0;
  constructor(props) {
    super(props);
    this.state = {
      resources: props.ids.map((id) => props.data[id]),
      latestId: props.ids[props.ids.length - 1]
    };
  }

  updateData = () => {
    this.props.crudGetList(
      this.props.resource,
      { page: this.page, perPage: 10 },
      { field: "id", order: "ASC" }
    );
  };

  componentWillUnmount() {
    this.page = 0;
    this.updateData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.ids !== prevProps.ids) {
      const { ids, data } = this.props;
      const latestId = ids[ids.length - 1];
      if (latestId && latestId !== prevState.latestId) {
        const newItems = ids.map((id) => data[id]);
        this.setState((state) => ({
          resources: state.resources.concat(newItems),
          latestId
        }));
      }
    }
  }

  handleLoadMore = () => {
    this.page = this.page + 1;
    this.updateData();
  };

  getChildrenWithProps = (props, isHeader = false) => {
    const items = React.Children.map(this.props.children, (child) => {
      // checking isValidElement is the safe way and avoids a typescript error too
      if (React.isValidElement(child)) {
        return (
          <TableCell>
            {React.cloneElement(child, {
              ...child.props,
              record: props,
              isHeader
            })}
          </TableCell>
        );
      }
      return child;
    });
    return <TableRow>{items}</TableRow>;
  };

  getHeaders = () => {
    const cells = React.Children.map(this.props.children, (child) => {
      // checking isValidElement is the safe way and avoids a typescript error too
      return <TableCell>{child.props.source}</TableCell>;
    });
    return <TableRow>{cells}</TableRow>;
  };

  render() {
    const { resources } = this.state;
    const resourceList = resources.map((r) => this.getChildrenWithProps(r));
    const resourceHead = this.getHeaders();
    return (
      <InfiniteScroll
        pageStart={1}
        loadMore={() => this.handleLoadMore()}
        hasMore={true || false}
        loader={
          <div
            style={{
              padding: 20,
              textAlign: "center",
              fontFamily: "system-ui"
            }}
            key={0}
          >
            Loading ...
          </div>
        }
      >
        <TableContainer component={Paper}>
          <Table>
            <TableHead>{resourceHead} </TableHead>
            <TableBody>{resourceList}</TableBody>
          </Table>
          {/* <button onClick={() => this.handleLoadMore()}>Load</button> */}
        </TableContainer>
      </InfiniteScroll>
    );
  }
}

DataView.defaultProps = {
  ids: [],
  data: {}
  // crudGetList: () => null,
};

const mapStateToProps = (state, ownProps) => {
  const { resource } = ownProps;
  return {
    ids: state.admin.resources[resource].list.ids,
    data: state.admin.resources[resource].data,
    total: state.admin.resources[resource].list.total,
    loadedOnce: state.admin.resources[resource].list.loadedOnce
  };
};

const DataViewComp = connect(mapStateToProps, { crudGetList })(DataView);

const DataTextField = ({ record, source }) => {
  return <span>{record[source]} </span>;
};

const MyList = ({ children, ...props }) => {
  return (
    <ListBase {...props}>
      <Title title={props.resource}></Title>
      <DataViewComp {...props}>
        <DataTextField source="id" />
        <DataTextField source="title" />
      </DataViewComp>
    </ListBase>
  );
};

const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="todos" list={MyList} />
    <Resource name="posts" list={MyList} />
  </Admin>
);

export default App;
