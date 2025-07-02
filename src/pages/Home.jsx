<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Star Wars Explorer - SWAPI</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            background-color: #f8f9fa;
        }
        .navbar-brand {
            font-size: 1.5rem;
        }
        .card-img-top {
            height: 300px;
            object-fit: cover;
        }
        .btn-favorite {
            font-size: 1.2rem;
        }
        .detail-image {
            max-height: 500px;
            object-fit: cover;
        }
        .favorites-dropdown {
            max-height: 400px;
            overflow-y: auto;
        }
        .loading-spinner {
            margin: 50px auto;
        }
    </style>
</head>
<body>
    <div id="app">
       
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container">
                <a class="navbar-brand fw-bold" href="#" onclick="showHome()">
                    <span class="text-warning">Star Wars</span> Explorer
                </a>
                
                <div class="navbar-nav ms-auto">
                    <a class="nav-link" href="#" onclick="showHome()">Home</a>
                    <div class="dropdown">
                        <button class="btn btn-outline-warning ms-2 dropdown-toggle position-relative" 
                                type="button" data-bs-toggle="dropdown">
                            Favoritos
                            <span id="favorites-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="display: none;">
                                0
                            </span>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end favorites-dropdown" style="min-width: 300px;">
                            <li><h6 class="dropdown-header">Mis Favoritos</h6></li>
                            <div id="favorites-list">
                                <li><span class="dropdown-item-text text-muted">No tienes favoritos guardados</span></li>
                            </div>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>

        
        <div class="container py-4">
            <!-- Vista Home -->
            <div id="home-view">
                <div class="text-center mb-4">
                    <h1 class="display-4 fw-bold">Explora el Universo de <span class="text-warning">Star Wars</span></h1>
                    <p class="lead">Descubre personajes, vehículos y planetas de una galaxia muy, muy lejana...</p>
                </div>

                
                <ul class="nav nav-pills nav-fill mb-4">
                    <li class="nav-item">
                        <button class="nav-link active" id="people-tab" onclick="switchTab('people')">
                            Personajes
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="vehicles-tab" onclick="switchTab('vehicles')">
                            Vehículos
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" id="planets-tab" onclick="switchTab('planets')">
                            Planetas
                        </button>
                    </li>
                </ul>

                
                <div id="loading" class="text-center loading-spinner" style="display: none;">
                    <div class="spinner-border text-warning" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>

                
                <div id="entities-grid" class="row"></div>
            </div>

            
            <div id="detail-view" style="display: none;">
                <button class="btn btn-outline-secondary mb-4" onclick="showHome()">
                    ← Volver
                </button>
                <div id="detail-content"></div>
            </div>
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    <script>
        
        var appState = {
            currentTab: 'people',
            favorites: [],
            entities: {},
            currentView: 'home'
        };

        
        function loadFavorites() {
            try {
                var savedFavorites = localStorage.getItem('starwars-favorites');
                if (savedFavorites) {
                    appState.favorites = JSON.parse(savedFavorites);
                }
            } catch (error) {
                console.error('Error loading favorites:', error);
                appState.favorites = [];
            }
        }

       
        function getImageUrl(type, id) {
            var baseUrl = 'https://starwars-visualguide.com/assets/img';
            var typeMap = {
                people: 'characters',
                vehicles: 'vehicles',
                planets: 'planets'
            };
            return baseUrl + '/' + typeMap[type] + '/' + id + '.jpg';
        }

        function saveFavorites() {
            try {
                localStorage.setItem('starwars-favorites', JSON.stringify(appState.favorites));
            } catch (error) {
                console.error('Error saving favorites:', error);
            }
            updateFavoritesUI();
        }

        function isFavorite(uid, type) {
            return appState.favorites.some(function(fav) {
                return fav.uid === uid && fav.type === type;
            });
        }

        function addFavorite(item) {
            if (!isFavorite(item.uid, item.type)) {
                appState.favorites.push(item);
                saveFavorites();
            }
        }

        function removeFavorite(uid, type) {
            appState.favorites = appState.favorites.filter(function(fav) {
                return !(fav.uid === uid && fav.type === type);
            });
            saveFavorites();
        }

        function toggleFavorite(item) {
            if (isFavorite(item.uid, item.type)) {
                removeFavorite(item.uid, item.type);
            } else {
                addFavorite(item);
            }
        }

        function updateFavoritesUI() {
            var badge = document.getElementById('favorites-badge');
            var favoritesList = document.getElementById('favorites-list');
            
            if (appState.favorites.length > 0) {
                badge.textContent = appState.favorites.length;
                badge.style.display = 'block';
                
                var favoritesHtml = appState.favorites.map(function(fav) {
                    return '<li>' +
                        '<div class="dropdown-item d-flex justify-content-between align-items-center">' +
                            '<div>' +
                                '<a href="#" onclick="showDetail(\'' + fav.type + '\', \'' + fav.uid + '\')" class="text-decoration-none">' +
                                    '<strong>' + fav.name + '</strong>' +
                                '</a>' +
                                '<br><small class="text-muted">' + fav.type + '</small>' +
                            '</div>' +
                            '<button class="btn btn-sm btn-outline-danger" onclick="removeFavorite(\'' + fav.uid + '\', \'' + fav.type + '\')">' +
                                '×' +
                            '</button>' +
                        '</div>' +
                    '</li>';
                }).join('');
                
                favoritesList.innerHTML = favoritesHtml;
            } else {
                badge.style.display = 'none';
                favoritesList.innerHTML = '<li><span class="dropdown-item-text text-muted">No tienes favoritos guardados</span></li>';
            }
        }

        
        function fetchEntities(type) {
            return fetch('https://www.swapi.tech/api/' + type)
                .then(function(response) {
                    if (!response.ok) throw new Error('Error fetching data');
                    return response.json();
                })
                .then(function(data) {
                    appState.entities[type] = data.results;
                    return data.results;
                })
                .catch(function(error) {
                    console.error('Error:', error);
                    return [];
                });
        }

        function fetchEntityDetail(type, id) {
            return fetch('https://www.swapi.tech/api/' + type + '/' + id)
                .then(function(response) {
                    if (!response.ok) throw new Error('Error fetching data');
                    return response.json();
                })
                .then(function(data) {
                    return data.result;
                })
                .catch(function(error) {
                    console.error('Error:', error);
                    return null;
                });
        }

        
        function showLoading() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('entities-grid').innerHTML = '';
        }

        function hideLoading() {
            document.getElementById('loading').style.display = 'none';
        }

        function createEntityCard(entity, type) {
            var imageUrl = getImageUrl(type, entity.uid);
            var isInFavorites = isFavorite(entity.uid, type);
            
            return '<div class="col-lg-4 col-md-6 mb-4">' +
                '<div class="card h-100 shadow-sm">' +
                    '<img src="' + imageUrl + '" class="card-img-top" alt="' + entity.name + '"' +
                         ' onerror="this.src=\'https://via.placeholder.com/300x300/333/fff?text=No+Image\'">' +
                    '<div class="card-body d-flex flex-column">' +
                        '<h5 class="card-title">' + entity.name + '</h5>' +
                        '<div class="mt-auto d-flex justify-content-between">' +
                            '<button class="btn btn-primary" onclick="showDetail(\'' + type + '\', \'' + entity.uid + '\')">' +
                                'Ver Detalles' +
                            '</button>' +
                            '<button class="btn ' + (isInFavorites ? 'btn-warning' : 'btn-outline-warning') + ' btn-favorite" ' +
                                    'onclick="toggleFavoriteAndUpdate({uid: \'' + entity.uid + '\', name: \'' + entity.name + '\', type: \'' + type + '\'})">' +
                                (isInFavorites ? '★' : '☆') +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }

        function renderEntities(entities, type) {
            var grid = document.getElementById('entities-grid');
            var html = entities.map(function(entity) {
                return createEntityCard(entity, type);
            }).join('');
            grid.innerHTML = html;
        }

        function switchTab(type) {
            
            var tabs = document.querySelectorAll('.nav-link');
            tabs.forEach(function(tab) {
                tab.classList.remove('active');
            });
            document.getElementById(type + '-tab').classList.add('active');
            
            appState.currentTab = type;
            
            showLoading();
            
            
            if (!appState.entities[type]) {
                fetchEntities(type).then(function() {
                    hideLoading();
                    renderEntities(appState.entities[type] || [], type);
                });
            } else {
                hideLoading();
                renderEntities(appState.entities[type] || [], type);
            }
        }

        function showDetail(type, id) {
            document.getElementById('home-view').style.display = 'none';
            document.getElementById('detail-view').style.display = 'block';
            
            var detailContent = document.getElementById('detail-content');
            detailContent.innerHTML = '<div class="text-center">' +
                '<div class="spinner-border text-warning" role="status">' +
                    '<span class="visually-hidden">Cargando...</span>' +
                '</div>' +
            '</div>';
            
            fetchEntityDetail(type, id).then(function(entity) {
                if (entity) {
                    var properties = entity.properties;
                    var imageUrl = getImageUrl(type, id);
                    var isInFavorites = isFavorite(id, type);
                    
                    var propertiesHtml = Object.entries(properties)
                        .filter(function(entry) {
                            return !['created', 'edited', 'url'].includes(entry[0]);
                        })
                        .map(function(entry) {
                            var key = entry[0];
                            var value = entry[1];
                            return '<div class="row mb-2">' +
                                '<div class="col-4">' +
                                    '<strong class="text-capitalize">' + key.replace(/_/g, ' ') + ':</strong>' +
                                '</div>' +
                                '<div class="col-8">' +
                                    (Array.isArray(value) ? value.join(', ') : value || 'N/A') +
                                '</div>' +
                            '</div>';
                        }).join('');
                    
                    detailContent.innerHTML = '<div class="row">' +
                        '<div class="col-md-4">' +
                            '<img src="' + imageUrl + '" class="img-fluid rounded shadow detail-image" alt="' + properties.name + '"' +
                                 ' onerror="this.src=\'https://via.placeholder.com/400x400/333/fff?text=No+Image\'">' +
                        '</div>' +
                        '<div class="col-md-8">' +
                            '<div class="d-flex justify-content-between align-items-start mb-3">' +
                                '<h1 class="display-5">' + properties.name + '</h1>' +
                                '<button class="btn ' + (isInFavorites ? 'btn-warning' : 'btn-outline-warning') + ' btn-favorite" ' +
                                        'onclick="toggleFavorite({uid: \'' + id + '\', name: \'' + properties.name + '\', type: \'' + type + '\'}); updateDetailFavoriteButton(\'' + id + '\', \'' + type + '\')">' +
                                    (isInFavorites ? '★' : '☆') +
                                '</button>' +
                            '</div>' +
                            '<div class="card">' +
                                '<div class="card-header">' +
                                    '<h5 class="mb-0">Detalles</h5>' +
                                '</div>' +
                                '<div class="card-body">' +
                                    propertiesHtml +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
                } else {
                    detailContent.innerHTML = '<div class="alert alert-danger">Error al cargar los detalles</div>';
                }
            });
        }

        function updateDetailFavoriteButton(uid, type) {
            var button = document.querySelector('.btn-favorite');
            var isInFavorites = isFavorite(uid, type);
            
            if (button) {
                button.className = 'btn ' + (isInFavorites ? 'btn-warning' : 'btn-outline-warning') + ' btn-favorite';
                button.innerHTML = isInFavorites ? '★' : '☆';
            }
        }

        function showHome() {
            document.getElementById('detail-view').style.display = 'none';
            document.getElementById('home-view').style.display = 'block';
            appState.currentView = 'home';
        }

        function toggleFavoriteAndUpdate(item) {
            toggleFavorite(item);
            
            
            if (appState.currentView === 'home') {
                renderEntities(appState.entities[appState.currentTab] || [], appState.currentTab);
            }
        }

       
        document.addEventListener('DOMContentLoaded', function() {
            loadFavorites();
            updateFavoritesUI();
            switchTab('people');
        });
    </script>
</body>
</html>