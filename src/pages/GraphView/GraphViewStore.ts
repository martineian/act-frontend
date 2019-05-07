import {action, computed, observable} from 'mobx';
import MainPageStore from "../MainPageStore";
import getStyle from '../../core/cytoscapeStyle';
import {ActObject, Search} from "../QueryHistory";

export type Node = {
    id: string|null
    type: "fact"| "object"
}

class GraphViewStore {

    root: MainPageStore;

    @observable selectedNode: Node = {type: "fact", id: null};

    constructor(root: MainPageStore) {
        this.root = root;
    }

    @computed get prepared() {

        return {
            selectedNode: this.selectedNode.id,
            elements: this.root.refineryStore.cytoscapeElements,
            layout: this.root.ui.cytoscapeLayoutStore.graphOptions.layout.layoutObject,
            style: getStyle({ showEdgeLabels: this.root.ui.cytoscapeLayoutStore.graphOptions.showFactEdgeLabels }),
            onNodeClick: (node : any) => {
                this.root.backendStore.executeQuery({
                    objectType: node.data('type'),
                    objectValue: node.data('value'),
                    query: ""
                })
            },
            onNodeCtxClick: (node : any) => {
                const nodeId = node.data('isFact') ? node.data('factId') : node.id();
                const nodeType = node.data('isFact') ? 'fact' : 'object';
                this.setSelectedNode({id: nodeId , type: nodeType});
            }
        }
    }

    @action
    setSelectedNode(value: Node) {
        this.selectedNode = value;
    }

    @action
    setSelectedNodeBasedOnSearch(search: Search) {
        // Select the searched object (can't do that on graph queries)
        if (!search.query) {
            const searchedNode = Object.values(this.root.refineryStore.refined.objects)
                .find( (object: ActObject) => object.type.name === search.objectType &&
                    object.value === search.objectValue);
            if (searchedNode) {
                this.root.ui.cytoscapeStore.setSelectedNode({id: searchedNode.id, type: 'object'})
            }
        }
    }
}

export default GraphViewStore;