let safe_zone = {
    lat:-8.367838,
    lng:-35.03406,
    nome:'CD UNILEVER',
    cidade:'IPOJUCA/PE',
    endereco:'ROD. ARMINIO GUILHERME, IPOJUCA - PE, 55590-000',
    br:'',
    fone:'(81)35276900',
    raio:'1000',
    tipo:'S'
}

let escolha_usuario = document.querySelector('#escolha')      //objetivo: criar um objeto com as informações do json que com o sinal de escolha do html em true
fetch('Postos.json')                                          // irá enviar para a função de criar as bubbles e habilitalas ao mapa

//calcula a rota
function calculateRouteFromAtoB(platform) {                     
    var router = platform.getRoutingService(null, 8),
        routeRequestParams = {
          routingMode: 'fast',
          transportMode: 'car',
          origin: '-8.3678162,-35.0315702', // Brandenburg Gate
          destination: '-23.1019916,-46.9665265', // Friedrichstraße Railway Station
          return: 'polyline,turnByTurnActions,actions,instructions,travelSummary'
        };
  
    router.calculateRoute(
      routeRequestParams,
      onSuccess,
      onError
    );
  }
  
// se der certo, chama as outras funções, se não mostra um erro
  function onSuccess(result) {
    var route = result.routes[0];
  
    // executa todas as outras funções
    addRouteShapeToMap(route);
    addManueversToMap(route);
  }
  
// o se não
  function onError(error) {
    alert('Scooby o mapa não abriu! o que eu faço?');
  }
  

  // Informações gerais e passo a passo to show the map
  {
  var mapContainer = document.getElementById('map'),
    routeInstructionsContainer = document.getElementById('panel');
  
    // Utiliza a minha APIKEY para puxar/construir o mapa
  var platform = new H.service.Platform({
    apikey: "jGRg_Ect1fFtlZNTooinS43eoBHRbgULfqEuxEYA42U"
  });

  var defaultLayers = platform.createDefaultLayers();
  
  // Inicializa o mapa com o ponto inicial ao centro
  var map = new H.Map(mapContainer,
    defaultLayers.vector.normal.map, {
    center: {lat: -8.3678162, lng: -35.0315702},
    zoom: 13,
    pixelRatio: window.devicePixelRatio || 1
  });
  
 // testa para ter certeza que o mapa está ocupando todo o seus espaço dentro do container
  window.addEventListener('resize', () => map.getViewPort().resize());
  
  // Interações com o mapa
  // MapEvents enables the event system
  // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
  var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  
  // componotes da interface padrão
  var ui = H.ui.UI.createDefault(map, defaultLayers);
  
  // mantem a ultima infobubble 
  var bubble;
}


  // informações que se aplicam
  function openBubble(position, text) {
    if (!bubble) {                                         
      bubble = new H.ui.InfoBubble(                       
        position,  {content: text});                       // The FO property holds the province name.
      ui.addBubble(bubble);
    } else {
      bubble.setPosition(position);
      bubble.setContent(text);
      bubble.open();
    }
  }
  

  //estilo da rota e a adiciona no mapa
  function addRouteShapeToMap(route) {
    route.sections.forEach((section) => {
        let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

      let polyline = new H.map.Polyline(linestring, {                               //STYLE DA ROTA
        style: {
          lineWidth: 8,
          strokeColor: 'rgba(0, 255, 0, 1)'
        }
      });
  
      // Add the polyline to the map
      map.addObject(polyline);
      // And zoom to its bounding rectangle
      map.getViewModel().setLookAtData({
        bounds: polyline.getBoundingBox()
      });
    });
  }
  

// adiciona a parte interativa do mapa, como os bubbles e informações
  function addManueversToMap(route) {
    var svgMarkup = '<svg width="18" height="18" ' + 'xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="8" cy="8" r="8" ' +
        'fill="#1b468d" stroke="white" stroke-width="1" />' +
      '</svg>',
      dotIcon = new H.map.Icon(svgMarkup, {anchor: {x:8, y:8}}),  
      group = new H.map.Group(),
      i,
      j;
  
    route.sections.forEach((section) => {
      let poly = H.geo.LineString.fromFlexiblePolyline(section.polyline).getLatLngAltArray();  // pega a localização da rota correspondente a uma ação a qual o motorista deve fazer
  
      let actions = section.actions;

      // posições em que irá construir as bubbles
      for (i = 0; i < actions.length; i += 1) {
        let action = actions[i];
        var marker = new H.map.Marker({
          lat: poly[action.offset * 3],
          lng: poly[action.offset * 3 + 1]},
          {icon: dotIcon});
        marker.instruction = action.instruction;
        group.addObject(marker);
      }
  
        //cria o evento
      group.addEventListener('tap', function (evt) {
        map.setCenter(evt.target.getGeometry());
        openBubble(evt.target.getGeometry(), evt.target.instruction);
      }, false);
  
      // Add the maneuvers group to the map
      map.addObject(group);
    });
  }
  
  
  // Now use the map as required...
  calculateRouteFromAtoB(platform);
