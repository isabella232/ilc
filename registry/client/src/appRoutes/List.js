import React, { Children, Fragment, cloneElement, memo, useState, useEffect } from 'react';
import { useMediaQuery, makeStyles } from '@material-ui/core';
import {
    BulkDeleteButton,
    Datagrid,
    EditButton,
    List,
    SimpleList,
    TextField,
    BooleanField,
    Filter,
    BooleanInput,
    SelectInput,
    ReferenceField,
    Link,
    TopToolbar,
    Button,
    sanitizeListRestProps,
} from 'react-admin'; // eslint-disable-line import/no-unresolved
import IconAdd from '@material-ui/icons/Add';


import dataProvider from '../dataProvider';

const ListBulkActions = memo(props => (
    <Fragment>
        <BulkDeleteButton {...props} />
    </Fragment>
));

const useStyles = makeStyles({
    toolbar: {
        alignItems: 'center',
        display: 'flex',
        marginTop: -1,
        marginBottom: -1,
    },
    filters: {
        alignItems: 'center',
        marginTop: '0',
    },
    filtersSpecial: {
        marginBottom: '-6px',
    },
});

const ListActionsToolbar = ({ children, ...props }) => {
    const classes = useStyles();

    return (
        <div className={classes.toolbar}>
            {Children.map(children, button => cloneElement(button, props))}
        </div>
    );
};

const ListFilter = ({ routerDomain, ...props }) => {
    const classes = useStyles();

    return (
        <Filter {...props} className={classes.filters}>
            <BooleanInput label="Show special" source="showSpecial" alwaysOn className={classes.filtersSpecial} />
            { 
                routerDomain.length
                ? <SelectInput 
                    alwaysOn
                    source="domainId"
                    label="Domain"
                    optionText="domainName"
                    resettable
                    choices={routerDomain}
                    />
                : null
            }
        </Filter>
    );
};

const ListGrid = ({ routerDomain, ...props }) => {
    return (
        <Datagrid {...props} rowClick="edit" optimized>
            {!props.filterValues.showSpecial ? <TextField source="id" sortable={false} /> : null }
            {!props.filterValues.showSpecial ? <TextField source="orderPos" sortable={false} /> : null }
            {!props.filterValues.showSpecial ? <TextField source="route" sortable={false} /> : null }
            {!props.filterValues.showSpecial ? <BooleanField source="next" sortable={false} /> : null }
            {props.filterValues.showSpecial ? <TextField source="specialRole" sortable={false} /> : null }
            <ReferenceField label="Template Name" source="templateName" reference="template" emptyText="-" sortable={false}>
                <TextField source="name" />
            </ReferenceField>
            {
                routerDomain.length
                ? <ReferenceField label="Domain Name" source="domainId" reference="router_domains" emptyText="-" sortable={false}>
                    <TextField source="domainName" />
                </ReferenceField>
                : null
            }
            
            <ListActionsToolbar>
                <EditButton />
            </ListActionsToolbar>
        </Datagrid>
    );
};

const ListActions = ({
    className,
    resource,
    filters,
    displayedFilters,
    filterValues,
    showFilter,
    ...rest
}) => (
    <TopToolbar className={className} {...sanitizeListRestProps(rest)}>
        {filters && cloneElement(filters, {
            resource,
            showFilter,
            displayedFilters,
            filterValues,
            context: 'button',
        })}
        <Link to={`/route/create${filterValues.showSpecial ? '?special=1' : ''}`}>
            <Button label={`create ${filterValues.showSpecial ? 'special route' : ''}`}>
                <IconAdd />
            </Button>
        </Link>
    </TopToolbar>
);

const PostList = props => {
    const isSmall = useMediaQuery(theme => theme.breakpoints.down('sm'));

    const [routerDomain, setRouterDomain] = useState([]);

    useEffect(() => {
        dataProvider.getList('router_domains', { pagination: false, sort: false, filter: false })
            .then(({ data }) => {
                if (!data.length) {
                    return;
                }

                setRouterDomain([
                    {
                        id: 'null',
                        domainName: 'Non-specified',
                    },
                    ...data,
                ]);
            });
    }, []);

    return (
        <List
            {...props}
            bulkActionButtons={<ListBulkActions />}
            actions={<ListActions />}
            exporter={false}
            filters={<ListFilter routerDomain={routerDomain} />}
            perPage={25}
        >
            {isSmall ? (
                <SimpleList
                    primaryText={record => record.specialRole ? record.specialRole : record.route}
                    secondaryText={record => `next: ${record.next ? 'true' : 'false'}; template: ${record.templateName || '-'}`}
                />
            ) : (
                <ListGrid routerDomain={routerDomain} />
            )}
        </List>
    );
};

export default PostList;
