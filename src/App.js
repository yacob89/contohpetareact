import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import MapGL, {
  NavigationControl,
  AttributionControl,
  Source,
  Layer,
  FeatureState,
  Popup
} from "@urbica/react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Draw from "@urbica/react-map-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import {
  Button,
  Icon,
  Label,
  Grid,
  Segment,
  Input,
  Table,
  Tab,
  List,
  Image,
  Card,
  Sidebar,
  Menu,
  Header,
  Modal
} from "semantic-ui-react";
import axios from "axios";
let rows = [];

class App extends Component {
  constructor() {
    super();
    this.state = {
      viewportChangeMethod: "flyTo",
      viewport: {
        latitude: 37.832692,
        longitude: -122.479942,
        zoom: 16
      },
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              coordinates: [-122.41411987304815, 37.792209769935084],
              type: "Point"
            }
          }
        ]
      },
      lat: 37.832692, // <-- Contoh deklarasi state
      lng: -122.479942,
      zoom: 17,
      counter: 0,
      visible: true,
      modalOpen: false,
      hoveredStateId: null,
      clickedLayerCoordinate: {
        long: 0,
        lat: 0
      },
      cardColor: "red",
      layerlists: [],
      results: [],
      kumpulandata: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "asdf", desc: "zxcv" },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [-122.47685194015503, 37.83325962773994],
                  [-122.47678756713866, 37.83198857304299],
                  [-122.47517824172975, 37.83202246811909],
                  [-122.47522115707397, 37.8332935222321],
                  [-122.47685194015503, 37.83325962773994]
                ]
              ]
            }
          },
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [-122.47953414916992, 37.83129372055134],
                  [-122.47927665710448, 37.830514122161276],
                  [-122.47801065444946, 37.830107371905136],
                  [-122.47775316238402, 37.83105645234809],
                  [-122.47953414916992, 37.83129372055134]
                ]
              ]
            }
          }
        ]
      },
      //Draw Control Visible
      selectControlVisible: true,
      pointControlVisible: true,
      lineControlVisible: true,
      polygonControlVisible: true,
      trashControlVisible: true,
      mode: "simple_select"
    };
    this.updateDimensions = this.updateDimensions.bind(this);
    this.getLayersByUsername = this.getLayersByUsername.bind(this);
    this.onHover = this.onHover.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.layerOnClick = this.layerOnClick.bind(this);
    this.showLayer = this.showLayer.bind(this);
    this.hideLayer = this.hideLayer.bind(this);

    this.addFeatures = this.addFeatures.bind(this);
    this.createFeatures = this.createFeatures.bind(this);

    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentWillMount() {
    // <-- Event Method bawaan react
    this.updateDimensions();
  }

  componentDidMount() {
    // <-- Event Method bawaan react
    window.addEventListener("resize", this.updateDimensions.bind(this));
    this.getLayersByUsername();
  }

  componentWillUnmount() {
    // <-- Event Method bawaan react
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    // <-- Function bikinan sendiri untuk mengatur tampilan dimensi peta
    const height = window.innerWidth >= 992 ? window.innerHeight : 400;
    this.setState({ height: height });
  }

  onHover(event) {
    if (event.features.length > 0) {
      const hoveredStateId = event.features[0].id;
      if (hoveredStateId !== this.state.hoveredStateId) {
        this.setState({ hoveredStateId });
      }
    }
  }

  onLeave(event) {
    if (this.state.hoveredStateId) {
      this.setState({ hoveredStateId: null });
    }
  }

  layerOnClick(event) {
    console.log("OnClick Geometry: ", event.features[0].geometry);
    console.log("OnClick Properties: ", event.features[0].properties);
    console.log(
      "Clicked Coordinate lat: ",
      event.lngLat.lat,
      " Clicked Coordinate long: ",
      event.lngLat.lng
    );
    this.setState({
      clickedLayerCoordinate: { long: event.lngLat.lng, lat: event.lngLat.lat },
      viewport: {
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
        zoom: 16
      }
    });
  }

  getLayersByUsername() {
    rows = [];
    axios
      .get(
        "https://hnjp62bwxh.execute-api.us-west-2.amazonaws.com/GeoDev/getlayerbyusername",
        {
          params: {
            username: "yacob89"
          }
        }
      )
      .then(response => {
        // handle success
        const layerList = response.data;
        console.log("Response Layer List: ", layerList);

        var i;
        for (i = 0; i < layerList.length; i++) {
          rows.push({
            _id: layerList[i]._id,
            name: layerList[i].name,
            username: layerList[i].username,
            createdAt: layerList[i].createdAt,
            description: layerList[i].description,
            subscriber: layerList[i].subscriber,
            geojson: layerList[i].geojson,
            arrayindex: i,
            opacity: 0.5
          });
        }
        this.setState({
          layerlists: rows,
          results: rows
        });
      })
      .catch(error => {
        console.log("Axios error: ", error);
      });
  }

  addFeatures(event) {
    console.log("Add Features");
    //1. Disable semua layer yang tampil
    var temporaryLayer = this.state.layerlists;
    var i;
    for (i = 0; i < temporaryLayer.length; i++) {
      temporaryLayer[i].opacity = 0.0;
    }
    this.setState({ layerlists: temporaryLayer });
    //2. Menampilkan Draw Control
    //3. Ada default geojson data
    //4. Perlu ada tombol save
    this.handleOpen();
  }

  createFeatures(event) {
    console.log("Create Features: ", event.target.id);
    if (event.target.id === "create-point") {
      this.setState({ selectControlVisible: false });
      this.setState({ pointControlVisible: false });
      this.setState({ lineControlVisible: true });
      this.setState({ polygonControlVisible: true });
    }
    if (event.target.id === "create-line") {
      this.setState({ selectControlVisible: false });
      this.setState({ pointControlVisible: true });
      this.setState({ lineControlVisible: false });
      this.setState({ polygonControlVisible: true });
    }
    if (event.target.id === "create-polygon") {
      this.setState({ selectControlVisible: false });
      this.setState({ pointControlVisible: true });
      this.setState({ lineControlVisible: true });
      this.setState({ polygonControlVisible: false });
    }
  }

  showLayer(event) {
    console.log("Show Layer: ", event.target.id);
    var temporaryLayer = this.state.layerlists;
    temporaryLayer[event.target.id].opacity = 0.5;
    this.setState({ layerlists: temporaryLayer });
  }

  hideLayer(event) {
    console.log("Hide Layer: ", event.target.id);
    var temporaryLayer = this.state.layerlists;
    temporaryLayer[event.target.id].opacity = 0.0;
    this.setState({ layerlists: temporaryLayer });
  }

  handleHideClick = () => this.setState({ visible: false });
  handleShowClick = () => this.setState({ visible: true });
  handleSidebarHide = () => this.setState({ visible: false });

  handleOpen() {
    this.setState({ modalOpen: true });
  }
  handleClose() {
    this.setState({ modalOpen: false });
  }

  render() {
    const assetsCardStyle = {
      marginLeft: "0px",
      marginRight: "10px"
    };
    const { visible } = this.state;

    const layerpanes = [
      {
        menuItem: "Assets",
        pane: {
          key: "tab1",
          content: (
            <div>
              <Button basic color="blue" onClick={this.addFeatures}>
                Add Features
              </Button>
              {this.state.layerlists.map(i => (
                <Card fluid color="blue" style={assetsCardStyle}>
                  <Card.Content>
                    <Card.Header>{i.name}</Card.Header>
                    <Card.Meta>{i.createdAt}</Card.Meta>
                    <Card.Description>{i.description}</Card.Description>
                  </Card.Content>
                  <Card.Content extra>
                    <div className="ui two buttons">
                      <Button
                        id={i.arrayindex}
                        basic
                        color="green"
                        onClick={this.showLayer}
                      >
                        Show
                      </Button>
                      <Button
                        id={i.arrayindex}
                        basic
                        color="red"
                        onClick={this.hideLayer}
                      >
                        Hide
                      </Button>
                    </div>
                  </Card.Content>
                </Card>
              ))}
            </div>
          )
        }
      },
      {
        menuItem: "Style",
        pane: {
          key: "tab2",
          content: (
            <div>
              Color
              <Card fluid color="blue" style={assetsCardStyle}>
                <Card.Content>
                  <Grid divided="vertically">
                    <Grid.Row columns={2}>
                      <Grid.Column>
                        <Label basic size={"large"}>
                          Icon
                        </Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Button basic color="blue" content="Blue" />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={2}>
                      <Grid.Column>
                        <Label basic size={"large"}>
                          Fill
                        </Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Button basic color="blue" content="Blue" />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={2}>
                      <Grid.Column>
                        <Label basic size={"large"}>
                          Border
                        </Label>
                      </Grid.Column>
                      <Grid.Column>
                        <Button basic color="blue" content="Blue" />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Card.Content>
              </Card>
              Label
              <Card fluid color="blue" style={assetsCardStyle}>
                <Card.Content>
                  <Card.Header>Sungai Kita</Card.Header>
                  <Card.Meta>Keterangan</Card.Meta>
                  <Card.Description>Deskripsi Layer.</Card.Description>
                </Card.Content>
              </Card>
            </div>
          )
        }
      },
      {
        menuItem: "Analysis",
        pane: {
          key: "tab3",
          content: <span>Analysis</span>
        }
      },
      {
        menuItem: "Legend",
        pane: {
          key: "tab4",
          content: <span>Legend</span>
        }
      }
    ];

    const modalPanes = [
      {
        menuItem: "Create",
        render: () => (
          <Tab.Pane attached={false}>
            <Button.Group>
              <Button id="create-point" onClick={this.createFeatures}>
                Point
              </Button>
              <Button id="create-line" onClick={this.createFeatures}>
                Line
              </Button>
              <Button id="create-polygon" onClick={this.createFeatures}>
                Polygon
              </Button>
            </Button.Group>
          </Tab.Pane>
        )
      },
      {
        menuItem: "Import",
        render: () => <Tab.Pane attached={false}>Tab 2 Content</Tab.Pane>
      },
      {
        menuItem: "Assets",
        render: () => <Tab.Pane attached={false}>Tab 3 Content</Tab.Pane>
      }
    ];

    return (
      <div style={{ height: this.state.height }}>
        <MapGL
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/light-v9"
          accessToken={
            "pk.eyJ1IjoieWFjb2I4OSIsImEiOiJjamU3dTYxOXEwMzIwMnFteHB5MGYzbzZmIn0._u0BoH4XBwpB7EaYN8Xb2g"
          }
          latitude={this.state.viewport.latitude}
          longitude={this.state.viewport.longitude}
          zoom={this.state.viewport.zoom}
          onViewportChange={viewport => this.setState({ viewport })}
          attributionControl={false}
          viewportChangeMethod={this.state.viewportChangeMethod}
        >
          <NavigationControl showCompass showZoom position="top-left" />
          <AttributionControl
            compact={false}
            position="bottom-right"
            customAttribution="geo.mapid 2019"
          />
          <Draw
            mode={this.state.mode}
            onDrawModeChange={({ mode }) => this.setState({ mode })}
            data={this.state.data}
            onChange={data => this.setState({ data })}
            combineFeaturesControl={false}
            uncombineFeaturesControl={false}
            pointControl={false}
            lineStringControl={false}
            polygonControl={false}
            trashControl={this.state.trashControlVisible}
          />
          <Popup
            longitude={this.state.clickedLayerCoordinate.long}
            latitude={this.state.clickedLayerCoordinate.lat}
            closeButton={false}
            closeOnClick={false}
          >
            Hi there!
          </Popup>

          {this.state.layerlists.map(i => (
            <div>
              <Source
                id={"layer-" + i.arrayindex}
                type="geojson"
                data={i.geojson}
              />
              <Layer
                id={"layer-" + i.arrayindex}
                type="fill"
                source={"layer-" + i.arrayindex}
                paint={{
                  "fill-color": "#627BC1",
                  "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    1,
                    i.opacity
                  ]
                }}
                onHover={this.onHover}
                onLeave={this.onLeave}
                onClick={this.layerOnClick}
              />
            </div>
          ))}

          {this.state.hoveredStateId && (
            <FeatureState
              id={this.state.hoveredStateId}
              source="states"
              state={{ hover: true }}
            />
          )}
          <div
            style={{
              zIndex: 999,
              position: "absolute",
              top: "120px",
              left: "10px",
              display: "inline-block",
              height: "100%"
            }}
          >
            <Tab
              menu={{
                secondary: true,
                pointing: true,
                inverted: true,
                color: "blue"
              }}
              panes={layerpanes}
              renderActiveOnly={false}
            />
          </div>
          <div
            style={{
              position: "absolute",
              top: "120px",
              left: "400px"
            }}
          >
            <Card>
              <Card.Content>
                <Card.Header>Add New Feature</Card.Header>
                <Card.Meta>
                  <span className="date">Joined in 2015</span>
                </Card.Meta>
                <Card.Description>
                  <Tab
                    menu={{ secondary: true, pointing: true }}
                    panes={modalPanes}
                  />
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <Button basic color="green" content="OK" />
                <Button basic color="red" content="Cancel" />
              </Card.Content>
            </Card>
          </div>
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "50px"
            }}
          >
            <Button.Group>
              <Button disabled={this.state.selectControlVisible} onClick={() => this.setState({ mode: "simple_select" })}>
                Select
              </Button>
              <Button
                disabled={this.state.pointControlVisible}
                onClick={() => this.setState({ mode: "draw_point" })}
              >
                Point
              </Button>
              <Button
                disabled={this.state.lineControlVisible}
                onClick={() => this.setState({ mode: "draw_line_string" })}
              >
                Line
              </Button>
              <Button
                disabled={this.state.polygonControlVisible}
                onClick={() => this.setState({ mode: "draw_polygon" })}
              >
                Polygon
              </Button>
            </Button.Group>
          </div>
        </MapGL>
      </div>
    );
  }
}

export default App;
