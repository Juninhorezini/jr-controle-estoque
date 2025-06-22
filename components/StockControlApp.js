import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Package, MapPin, Grid, Save, X, Minus, Shield, Settings, Lock, User, ChevronDown } from 'lucide-react';
import { useStoredState, useUser } from '../hooks/useLocalStorage';

const StockControlApp = () => {
  const user = useUser();
  const [shelves, setShelves] = useStoredState('shelves', []);
  const [products, setProducts] = useStoredState('products', {});
  const [selectedShelf, setSelectedShelf] = useStoredState('selectedShelf', 0);
  const [searchSKU, setSearchSKU] = useState('');
  const [searchColor, setSearchColor] = useState('');
  const [showAddShelf, setShowAddShelf] = useState(false);
  const [showAddShelfToCorridor, setShowAddShelfToCorridor] = useState(false);
  const [selectedCorridorForNewShelf, setSelectedCorridorForNewShelf] = useState('');
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPosition, setEditingPosition] = useState(null);
  const [newShelfName, setNewShelfName] = useState('');
  const [newShelfRows, setNewShelfRows] = useState(4);
  const [newShelfCols, setNewShelfCols] = useState(6);
  const [highlightedPositions, setHighlightedPositions] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteShelfId, setDeleteShelfId] = useState(null);
  const [deletePassword, setDeletePassword] = useState('');
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [showEditShelf, setShowEditShelf] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const [showEditCorridor, setShowEditCorridor] = useState(false);
  const [editingCorridor, setEditingCorridor] = useState({ oldName: '', newName: '' });
  const [expandedCorridors, setExpandedCorridors] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Configurações de segurança
  const [securitySettings, setSecuritySettings] = useStoredState('securitySettings', {
    deleteProtection: 'password',
    adminUserId: '',
    deletePassword: 'admin123'
  });

  // Detectar se é mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Inicializar dados se necessário
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!Array.isArray(shelves) || shelves.length === 0) {
        const defaultShelves = [
          { id: 1, name: 'Corredor A - Prateleira 1', rows: 4, cols: 6, corridor: 'A' },
          { id: 2, name: 'Corredor A - Prateleira 2', rows: 3, cols: 5, corridor: 'A' },
          { id: 3, name: 'Corredor B - Prateleira 1', rows: 5, cols: 4, corridor: 'B' }
        ];
        setShelves(defaultShelves);
        
        const exampleProducts = {
          '1-0-0': { 
            sku: 'FO130', 
            unit: 'caixas',
            colors: [
              { code: '102', quantity: 6 },
              { code: '103', quantity: 5 },
              { code: '107', quantity: 9 }
            ]
          },
          '1-0-1': { 
            sku: 'BR250', 
            unit: 'peças',
            colors: [
              { code: '101', quantity: 15 },
              { code: '105', quantity: 8 }
            ]
          },
          '1-1-2': { 
            sku: 'AL100', 
            unit: 'caixas',
            colors: [
              { code: '102', quantity: 12 }
            ]
          },
          '2-0-0': { 
            sku: 'FO130', 
            unit: 'caixas',
            colors: [
              { code: '102', quantity: 3 },
              { code: '110', quantity: 7 }
            ]
          },
          '3-2-1': { 
            sku: 'TX400', 
            unit: 'unidades',
            colors: [
              { code: '201', quantity: 50 },
              { code: '202', quantity: 30 },
              { code: '203', quantity: 25 },
              { code: '204', quantity: 18 }
            ]
          }
        };
        setProducts(exampleProducts);
      }
      setIsInitialized(true);
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Funções auxiliares
  const canDelete = () => {
    if (securitySettings.deleteProtection === 'none') return true;
    if (securitySettings.deleteProtection === 'admin') {
      return user.id === securitySettings.adminUserId;
    }
    return true; // Para 'password', será verificado no modal
  };

  const addNewShelf = () => {
    if (!newShelfName.trim()) return;
    
    const newId = Math.max(...shelves.map(s => s.id), 0) + 1;
    const newShelf = {
      id: newId,
      name: newShelfName,
      rows: newShelfRows,
      cols: newShelfCols,
      corridor: newShelfName.charAt(0).toUpperCase()
    };
    
    setShelves([...shelves, newShelf]);
    setNewShelfName('');
    setNewShelfRows(4);
    setNewShelfCols(6);
    setShowAddShelf(false);
  };

  const addShelfToCorridor = () => {
    if (!selectedCorridorForNewShelf) return;
    
    const corridorShelves = shelves.filter(s => s.corridor === selectedCorridorForNewShelf);
    const shelfNumber = corridorShelves.length + 1;
    const newShelfName = `Corredor ${selectedCorridorForNewShelf} - Prateleira ${shelfNumber}`;
    
    const newId = Math.max(...shelves.map(s => s.id), 0) + 1;
    const newShelf = {
      id: newId,
      name: newShelfName,
      rows: 4,
      cols: 6,
      corridor: selectedCorridorForNewShelf
    };
    
    setShelves([...shelves, newShelf]);
    setShowAddShelfToCorridor(false);
    setSelectedCorridorForNewShelf('');
  };

  const deleteShelf = () => {
    if (securitySettings.deleteProtection === 'password' && deletePassword !== securitySettings.deletePassword) {
      alert('Senha incorreta!');
      return;
    }
    
    if (securitySettings.deleteProtection === 'admin' && user.id !== securitySettings.adminUserId) {
      alert('Apenas o administrador pode excluir!');
      return;
    }
    
    setShelves(shelves.filter(s => s.id !== deleteShelfId));
    const newProducts = { ...products };
    Object.keys(newProducts).forEach(key => {
      if (key.startsWith(`${deleteShelfId}-`)) {
        delete newProducts[key];
      }
    });
    setProducts(newProducts);
    
    setShowDeleteConfirm(false);
    setDeleteShelfId(null);
    setDeletePassword('');
  };

  const saveEditShelf = () => {
    const updatedShelves = shelves.map(shelf => 
      shelf.id === editingShelf.id ? editingShelf : shelf
    );
    setShelves(updatedShelves);
    setShowEditShelf(false);
    setEditingShelf(null);
  };

  const saveEditCorridor = () => {
    const updatedShelves = shelves.map(shelf => 
      shelf.corridor === editingCorridor.oldName 
        ? { ...shelf, corridor: editingCorridor.newName, name: shelf.name.replace(`Corredor ${editingCorridor.oldName}`, `Corredor ${editingCorridor.newName}`) }
        : shelf
    );
    setShelves(updatedShelves);
    setShowEditCorridor(false);
    setEditingCorridor({ oldName: '', newName: '' });
  };

  const editProduct = (shelfId, row, col) => {
    const key = `${shelfId}-${row}-${col}`;
    const existingProduct = products[key];
    
    setEditingPosition({ shelfId, row, col, key });
    setEditingProduct(existingProduct || { 
      sku: '', 
      unit: 'caixas',
      colors: [{ code: '', quantity: 0 }]
    });
    setShowEditProduct(true);
  };

  const saveProduct = () => {
    if (!editingProduct.sku.trim()) {
      alert('SKU é obrigatório!');
      return;
    }
    
    const validColors = editingProduct.colors.filter(c => c.code.trim() && c.quantity > 0);
    if (validColors.length === 0) {
      alert('Pelo menos uma cor com quantidade é obrigatória!');
      return;
    }
    
    const newProducts = { ...products };
    newProducts[editingPosition.key] = {
      ...editingProduct,
      colors: validColors
    };
    
    setProducts(newProducts);
    setShowEditProduct(false);
    setEditingProduct(null);
    setEditingPosition(null);
  };

  const removeProduct = () => {
    const newProducts = { ...products };
    delete newProducts[editingPosition.key];
    setProducts(newProducts);
    setShowEditProduct(false);
    setEditingProduct(null);
    setEditingPosition(null);
  };

  const addColor = () => {
    setEditingProduct({
      ...editingProduct,
      colors: [...editingProduct.colors, { code: '', quantity: 0 }]
    });
  };

  const removeColor = (index) => {
    const newColors = editingProduct.colors.filter((_, i) => i !== index);
    setEditingProduct({
      ...editingProduct,
      colors: newColors.length > 0 ? newColors : [{ code: '', quantity: 0 }]
    });
  };

  const updateColor = (index, field, value) => {
    const newColors = [...editingProduct.colors];
    newColors[index] = { ...newColors[index], [field]: value };
    setEditingProduct({
      ...editingProduct,
      colors: newColors
    });
  };

  // Funções de busca
  const searchProducts = () => {
    if (!searchSKU.trim() && !searchColor.trim()) {
      setHighlightedPositions([]);
      return;
    }
    
    const results = [];
    Object.entries(products).forEach(([key, product]) => {
      const [shelfId, row, col] = key.split('-').map(Number);
      
      const skuMatch = !searchSKU.trim() || product.sku.toLowerCase().includes(searchSKU.toLowerCase());
      const colorMatch = !searchColor.trim() || product.colors.some(c => 
        c.code.toLowerCase().includes(searchColor.toLowerCase())
      );
      
      if (skuMatch && colorMatch) {
        results.push({ shelfId, row, col, product });
      }
    });
    
    setHighlightedPositions(results);
    
    if (results.length > 0) {
      const firstResult = results[0];
      const targetShelf = shelves.find(s => s.id === firstResult.shelfId);
      if (targetShelf) {
        setSelectedShelf(firstResult.shelfId);
        
        // Expandir o corredor se necessário
        setExpandedCorridors(prev => ({
          ...prev,
          [targetShelf.corridor]: true
        }));
        
        // Scroll para o resultado
        setTimeout(() => {
          const element = document.getElementById(`position-${firstResult.shelfId}-${firstResult.row}-${firstResult.col}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  };

  const scrollToPosition = (shelfId, row, col) => {
    setSelectedShelf(shelfId);
    const targetShelf = shelves.find(s => s.id === shelfId);
    if (targetShelf) {
      setExpandedCorridors(prev => ({
        ...prev,
        [targetShelf.corridor]: true
      }));
    }
    
    setTimeout(() => {
      const element = document.getElementById(`position-${shelfId}-${row}-${col}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-yellow-400');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-yellow-400');
        }, 2000);
      }
    }, 100);
  };

  // Agrupar prateleiras por corredor
  const corridors = shelves.reduce((acc, shelf) => {
    if (!acc[shelf.corridor]) {
      acc[shelf.corridor] = [];
    }
    acc[shelf.corridor].push(shelf);
    return acc;
  }, {});

  // Resultados da busca
  const searchResults = highlightedPositions.map(result => {
    const shelf = shelves.find(s => s.id === result.shelfId);
    return {
      ...result,
      shelfName: shelf?.name || 'Prateleira não encontrada',
      position: `L${result.row + 1}:C${result.col + 1}`
    };
  });

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-gray-900">Jr Controle Estoque</h1>
                <p className="text-sm text-gray-500">Sistema Profissional de Controle de Estoque</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSecuritySettings(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Configurações de Segurança"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
                <User className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">{user.name}</span>
              </div>
            </div>
          </div>

          {/* Busca */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por SKU..."
                  value={searchSKU}
                  onChange={(e) => setSearchSKU(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por código de cor..."
                  value={searchColor}
                  onChange={(e) => setSearchColor(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            
            <button
              onClick={searchProducts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Buscar
            </button>
          </div>

          {/* Resultados da busca */}
          {searchResults.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                Resultados encontrados ({searchResults.length}):
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToPosition(result.shelfId, result.row, result.col)}
                    className="text-left p-2 bg-white rounded border hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      SKU: {result.product.sku}
                    </div>
                    <div className="text-xs text-gray-600">
                      📍 {result.shelfName} - {result.position}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cores: {result.product.colors.map(c => c.code).join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg shadow-sm p-3 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={() => setShowAddShelf(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Novo Corredor
            </button>
            
            {Object.keys(corridors).length > 0 && (
              <button
                onClick={() => setShowAddShelfToCorridor(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Nova Prateleira
              </button>
            )}
          </div>
        </div>

        {/* Lista de Corredores */}
        <div className="space-y-4">
          {Object.entries(corridors).sort(([a], [b]) => a.localeCompare(b)).map(([corridor, corridorShelves]) => (
            <div key={corridor} className="bg-white rounded-lg shadow-sm">
              <div 
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedCorridors(prev => ({
                  ...prev,
                  [corridor]: !prev[corridor]
                }))}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedCorridors[corridor] ? 'rotate-180' : ''
                    }`} 
                  />
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Corredor {corridor}
                  </h2>
                  <span className="text-sm text-gray-500">
                    ({corridorShelves.length} prateleira{corridorShelves.length !== 1 ? 's' : ''})
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCorridor({ oldName: corridor, newName: corridor });
                    setShowEditCorridor(true);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              {expandedCorridors[corridor] && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  {corridorShelves.sort((a, b) => a.name.localeCompare(b.name)).map(shelf => (
                    <div key={shelf.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Grid className="w-4 h-4 text-gray-600" />
                          <h3 className="font-medium text-gray-900">{shelf.name}</h3>
                          <span className="text-sm text-gray-500">
                            ({shelf.rows}×{shelf.cols})
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingShelf({ ...shelf });
                              setShowEditShelf(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {canDelete() && (
                            <button
                              onClick={() => {
                                setDeleteShelfId(shelf.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Grid da prateleira */}
                      <div 
                        className="grid gap-1 md:gap-2"
                        style={{ 
                          gridTemplateColumns: `repeat(${shelf.cols}, 1fr)`,
                          maxWidth: '100%'
                        }}
                      >
                        {Array.from({ length: shelf.rows }, (_, row) =>
                          Array.from({ length: shelf.cols }, (_, col) => {
                            const key = `${shelf.id}-${row}-${col}`;
                            const product = products[key];
                            const isHighlighted = highlightedPositions.some(
                              pos => pos.shelfId === shelf.id && pos.row === row && pos.col === col
                            );
                            
                            return (
                              <button
                                key={key}
                                id={`position-${shelf.id}-${row}-${col}`}
                                onClick={() => editProduct(shelf.id, row, col)}
                                className={`
                                  aspect-square p-1 md:p-2 rounded border-2 transition-all text-xs
                                  ${product 
                                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                  }
                                  ${isHighlighted ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
                                `}
                              >
                                <div className="text-xs font-mono text-gray-500 mb-1">
                                  L{row + 1}:C{col + 1}
                                </div>
                                {product && (
                                  <div className="text-center">
                                    <div className="font-semibold text-blue-900 truncate">
                                      {product.sku}
                                    </div>
                                    <div className="text-gray-600 text-xs">
                                      {product.colors.length} cor{product.colors.length !== 1 ? 'es' : ''}
                                    </div>
                                  </div>
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mensagem se não há prateleiras */}
        {shelves.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma prateleira criada
            </h3>
            <p className="text-gray-600 mb-4">
              Comece criando seu primeiro corredor para organizar o estoque.
            </p>
            <button
              onClick={() => setShowAddShelf(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Criar Primeiro Corredor
            </button>
          </div>
        )}

        {/* Modal: Adicionar Prateleira */}
        {showAddShelf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Novo Corredor</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da primeira prateleira:
                  </label>
                  <input
                    type="text"
                    value={newShelfName}
                    onChange={(e) => setNewShelfName(e.target.value)}
                    placeholder="Ex: Corredor A - Prateleira 1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Linhas:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newShelfRows}
                      onChange={(e) => setNewShelfRows(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Colunas:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newShelfCols}
                      onChange={(e) => setNewShelfCols(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddShelf(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addNewShelf}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Criar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Adicionar Prateleira a Corredor */}
        {showAddShelfToCorridor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Adicionar Prateleira</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selecione o corredor:
                </label>
                <select
                  value={selectedCorridorForNewShelf}
                  onChange={(e) => setSelectedCorridorForNewShelf(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Escolha um corredor...</option>
                  {Object.keys(corridors).sort().map(corridor => (
                    <option key={corridor} value={corridor}>
                      Corredor {corridor} ({corridors[corridor].length} prateleiras)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddShelfToCorridor(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addShelfToCorridor}
                  disabled={!selectedCorridorForNewShelf}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Editar Produto */}
        {showEditProduct && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {products[editingPosition?.key] ? 'Editar' : 'Adicionar'} Produto
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU: *
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) => setEditingProduct({...editingProduct, sku: e.target.value})}
                    placeholder="Código do produto"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade:
                  </label>
                  <select
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({...editingProduct, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="caixas">Caixas</option>
                    <option value="peças">Peças</option>
                    <option value="unidades">Unidades</option>
                    <option value="pacotes">Pacotes</option>
                    <option value="metros">Metros</option>
                    <option value="litros">Litros</option>
                    <option value="quilos">Quilos</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Cores e Quantidades: *
                    </label>
                    <button
                      onClick={addColor}
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      + Cor
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editingProduct.colors.map((color, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Código"
                          value={color.code}
                          onChange={(e) => updateColor(index, 'code', e.target.value)}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                          type="number"
                          placeholder="Qtd"
                          min="0"
                          value={color.quantity}
                          onChange={(e) => updateColor(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {editingProduct.colors.length > 1 && (
                          <button
                            onClick={() => removeColor(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditProduct(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                
                {products[editingPosition?.key] && (
                  <button
                    onClick={removeProduct}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Remover
                  </button>
                )}
                
                <button
                  onClick={saveProduct}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Confirmar Exclusão */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-red-600 mb-4">Confirmar Exclusão</h3>
              
              <p className="text-gray-700 mb-4">
                Tem certeza que deseja excluir esta prateleira? Todos os produtos serão removidos.
              </p>
              
              {securitySettings.deleteProtection === 'password' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Digite a senha para confirmar:
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteShelf}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Configurações de Segurança */}
        {showSecuritySettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Configurações de Segurança
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proteção para exclusão:
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deleteProtection"
                        value="none"
                        checked={securitySettings.deleteProtection === 'none'}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          deleteProtection: e.target.value
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Sem proteção</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deleteProtection"
                        value="password"
                        checked={securitySettings.deleteProtection === 'password'}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          deleteProtection: e.target.value
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Protegido por senha</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="deleteProtection"
                        value="admin"
                        checked={securitySettings.deleteProtection === 'admin'}
                        onChange={(e) => setSecuritySettings({
                          ...securitySettings,
                          deleteProtection: e.target.value
                        })}
                        className="mr-2"
                      />
                      <span className="text-sm">Apenas administrador</span>
                    </label>
                  </div>
                </div>
                
                {securitySettings.deleteProtection === 'password' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Senha para exclusão:
                    </label>
                    <input
                      type="text"
                      value={securitySettings.deletePassword}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        deletePassword: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
                
                {securitySettings.deleteProtection === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID do Administrador:
                    </label>
                    <input
                      type="text"
                      value={securitySettings.adminUserId}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        adminUserId: e.target.value
                      })}
                      placeholder={user.id}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Seu ID atual: {user.id}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowSecuritySettings(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Editar Prateleira */}
        {showEditShelf && editingShelf && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Editar Prateleira</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome:
                  </label>
                  <input
                    type="text"
                    value={editingShelf.name}
                    onChange={(e) => setEditingShelf({...editingShelf, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Linhas:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingShelf.rows}
                      onChange={(e) => setEditingShelf({...editingShelf, rows: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Colunas:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={editingShelf.cols}
                      onChange={(e) => setEditingShelf({...editingShelf, cols: parseInt(e.target.value) || 1})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditShelf(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditShelf}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Editar Corredor */}
        {showEditCorridor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Renomear Corredor</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Novo nome do corredor:
                </label>
                <input
                  type="text"
                  value={editingCorridor.newName}
                  onChange={(e) => setEditingCorridor({...editingCorridor, newName: e.target.value})}
                  placeholder="Ex: A, B, C, 1, 2, 3..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Isso atualizará todas as prateleiras deste corredor
                </p>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowEditCorridor(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveEditCorridor}
                  disabled={!editingCorridor.newName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockControlApp;
