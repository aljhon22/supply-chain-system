import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScannerModal from '../components/QrScannerModal';
import { QRCodeSVG } from 'qrcode.react';
import '../App.css';
import customLogo from '../assets/scmw.jpg';

// Live Production Render Backend Gateway
const API_BASE_URL = 'https://supply-chain-system-pbir.onrender.com';

// 1. Permanent Default Furniture Dataset
const DEFAULT_INVENTORY_DATA = [
  {
    _id: 'item-1',
    name: 'Test Chair',
    itemName: 'Test Chair',
    category: 'Chairs & Seating',
    aisle: 'Aisle A',
    rack: 'Rack 1',
    binLocation: 'A-1-1',
    quantity: 3,
    minThreshold: 5,
    defects: 0,
    price: 25000,
    supplier: 'Test'
  },
  {
    _id: 'item-2',
    name: 'test',
    itemName: 'test',
    category: 'Chairs & Seating',
    aisle: 'Aisle A',
    rack: 'Rack 1',
    binLocation: 'A-1-1',
    quantity: 5,
    minThreshold: 5,
    defects: 0,
    price: 1000,
    supplier: 'Test'
  },
  {
    _id: 'item-3',
    name: 'test',
    itemName: 'test',
    category: 'Chairs & Seating',
    aisle: 'Aisle A',
    rack: 'Rack 1',
    binLocation: 'A-1-1',
    quantity: 5,
    minThreshold: 5,
    defects: 0,
    price: 1000,
    supplier: 'Test12'
  },
  {
    _id: 'item-4',
    name: 'Test table',
    itemName: 'Test table',
    category: 'Tables & Desks',
    aisle: 'Aisle A',
    rack: 'Rack 1',
    binLocation: 'A-1-1',
    quantity: 5,
    minThreshold: 5,
    defects: 0,
    price: 1000,
    supplier: 'Test'
  }
];

// 2. Default System Audit Logs
const DEFAULT_AUDIT_LOGS = [
  { _id: 'aud-1', timestamp: '10/14/2026, 10:45:00 PM', action: 'Security Session Authorized', role: 'Admin', details: 'RBAC Security Matrix validated successfully' },
  { _id: 'aud-2', timestamp: '10/14/2026, 09:30:15 PM', action: 'Purchase Order Created', role: 'Procurement', details: 'Created PO for 1 units of Test table' },
  { _id: 'aud-3', timestamp: '10/14/2026, 02:03:13 PM', action: 'User Login', role: 'Admin', details: "User 'Celecil' successfully authenticated and logged in." },
  { _id: 'aud-4', timestamp: '10/14/2026, 01:45:39 PM', action: 'User Login', role: 'Admin', details: "User 'Chadrick' successfully authenticated and logged in." },
  { _id: 'aud-5', timestamp: '10/13/2026, 11:20:10 PM', action: 'Stock Item Added', role: 'Admin', details: 'Added Table to Bin A-1-1' },
  { _id: 'aud-6', timestamp: '10/13/2026, 08:14:02 PM', action: 'Supplier Registered', role: 'Admin', details: 'Added vendor: Bestlink' },
  { _id: 'aud-7', timestamp: '10/12/2026, 02:05:20 PM', action: 'User Login', role: 'Admin', details: "User 'aqaqaq' successfully authenticated and logged in." },
  { _id: 'aud-8', timestamp: '10/02/2026, 02:07:31 AM', action: 'Inventory Item Created', role: 'Admin', details: 'Added new item: test at Bin A-1-1' },
  { _id: 'aud-9', timestamp: '10/02/2026, 01:48:46 AM', action: 'User Login', role: 'Admin', details: "User 'Mr.chan' successfully authenticated and logged in." },
  { _id: 'aud-10', timestamp: '10/01/2026, 10:17:06 PM', action: 'Supplier Registered', role: 'Admin', details: 'Added vendor: Test1' }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');

  // Global Theme Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('dashboard_theme') === 'dark');

  const setThemeMode = (modeIsDark) => {
    setIsDarkMode(modeIsDark);
    localStorage.setItem('dashboard_theme', modeIsDark ? 'dark' : 'light');
    showToast(`Switched to ${modeIsDark ? 'Dark' : 'Light'} Mode!`, 'info');
  };

  // Inventory State with LocalStorage Persistence
  const [inventoryList, setInventoryList] = useState(() => {
    const cached = localStorage.getItem('cached_inventory');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Inventory cache parse error.');
      }
    }
    return DEFAULT_INVENTORY_DATA;
  });

  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All Categories');
  const [itemForm, setItemForm] = useState({ name: '', category: 'Chairs & Seating', quantity: '', price: '', supplier: '', aisle: 'Aisle A', rack: 'Rack 1' });

  // Putaway State
  const [putawayCategory, setPutawayCategory] = useState('Chairs & Seating (Zone A)');
  const [recommendedBin, setRecommendedBin] = useState('');

  // Suppliers Dataset
  const [suppliersList, setSuppliersList] = useState([
    { id: 'SUP-01', _id: '6aba5b3dd3de7ad9f0783fa0', name: 'Test', contactPerson: 'test', email: 'test@gmail.com', phone: '0999999', address: 'test', rating: '4.9', leadTime: '2 Days' },
    { id: 'SUP-02', _id: '6abe9a50b33bbe35d84a0c1c', name: 'Test1', contactPerson: 'Test', email: 'Test@gmail.com', phone: '099999', address: 'Blk1lot2', rating: '4.8', leadTime: '3 Days' },
    { id: 'SUP-03', _id: '6abbd54152342f5e273c7012', name: 'Test12', contactPerson: 'kEV', email: 'test2@GMAIL.COM', phone: '099999', address: 'BLK1LOT22', rating: '4.7', leadTime: '1-2 Days' },
    { id: 'SUP-04', _id: '6abbd54152342f5e273c7099', name: 'Testing 1', contactPerson: 'Chan', email: 'testes@gmail.com', phone: '21312313', address: 'caloocan city', rating: '4.6', leadTime: '4 Days' }
  ]);
  const [supplierForm, setSupplierForm] = useState({ name: '', contactPerson: '', email: '', phone: '', address: '' });

  // Purchase Orders Dataset
  const [ordersList, setOrdersList] = useState([{ id: 'PO-2026-001', date: '10/13/2026', itemName: 'Test table', supplier: 'Test', quantity: 1, totalPrice: 1000, status: 'Pending' }]);
  const [poForm, setPoForm] = useState({ selectedItemName: '', assignedSupplier: 'N/A', quantity: '', unitPrice: 0 });
  const MONTHLY_BUDGET = 150000;

  // System Activity Audit Logs with LocalStorage Persistence
  const [auditLogs, setAuditLogs] = useState(() => {
    const cached = localStorage.getItem('cached_audit_logs');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Audit logs cache parse error.');
      }
    }
    return DEFAULT_AUDIT_LOGS;
  });

  const [defectiveLogs, setDefectiveLogs] = useState([]);

  // Modals & Toasts
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [selectedQrItem, setSelectedQrItem] = useState(null);
  const [isDefectModalOpen, setIsDefectModalOpen] = useState(false);
  const [selectedDefectItem, setSelectedDefectItem] = useState(null);
  const [defectReason, setDefectReason] = useState('');
  const [defectPhoto, setDefectPhoto] = useState(null);

  const [isPoPrintModalOpen, setIsPoPrintModalOpen] = useState(false);
  const [selectedPoForPrint, setSelectedPoForPrint] = useState(null);
  const [isAuditPrintModalOpen, setIsAuditPrintModalOpen] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Esc Key Listener for Modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsAuditPrintModalOpen(false);
        setIsPoPrintModalOpen(false);
        setIsQrModalOpen(false);
        setIsDefectModalOpen(false);
        setIsScannerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const playScanBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      console.warn('Audio unavailable:', e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    let storedRole = localStorage.getItem('role') || 'Admin';
    let storedName = localStorage.getItem('username') || 'Administrator';
    if (!token) { navigate('/login'); return; }

    setUserRole(storedRole);
    setUsername(storedName);
    fetchBackendData();
  }, [navigate]);

  const roleStr = (userRole || '').toLowerCase();
  const isAdmin = roleStr.includes('admin');
  const isProcurement = roleStr.includes('procure');
  const isWarehouse = roleStr.includes('warehouse') || (!isAdmin && !isProcurement);

  useEffect(() => {
    if (!isAdmin) {
      if (isWarehouse && (activeTab === 'orders' || activeTab === 'suppliers' || activeTab === 'audit-logs')) setActiveTab('overview');
      if (isProcurement && (activeTab === 'inventory' || activeTab === 'warehouse-map' || activeTab === 'audit-logs')) setActiveTab('overview');
    }
  }, [userRole, activeTab, isAdmin, isWarehouse, isProcurement]);

  const fetchBackendData = async () => {
    const token = localStorage.getItem('token');
    const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

    // 1. Fetch Inventory Records from Cloud Backend
    try {
      const invRes = await fetch(`${API_BASE_URL}/api/inventory`, { headers: authHeaders });
      if (invRes.ok) {
        const invData = await invRes.json();
        const resolvedInv = Array.isArray(invData) ? invData : (invData.inventory || invData.data || []);
        if (resolvedInv.length > 0) {
          setInventoryList(resolvedInv);
          localStorage.setItem('cached_inventory', JSON.stringify(resolvedInv));
        }
      }
    } catch {
      console.warn('Live API unreachable: Inventory running on offline local cache.');
    }

    // 2. Fetch System Activity Audit Logs from Cloud Backend
    try {
      const logRes = await fetch(`${API_BASE_URL}/api/audit`, { headers: authHeaders });
      if (logRes.ok) {
        const logData = await logRes.json();
        const resolvedLogs = Array.isArray(logData) 
          ? logData 
          : (logData.logs || logData.data || logData.auditLogs || []);

        if (resolvedLogs.length > 0) {
          setAuditLogs(resolvedLogs);
          localStorage.setItem('cached_audit_logs', JSON.stringify(resolvedLogs));
        }
      }
    } catch {
      console.warn('Live API unreachable: Audit logs running on offline local cache.');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/login');
  };

  const getItemName = (item) => (item?.itemName || item?.name || 'Furniture Item');
  const getSupplierName = (item) => {
    if (!item?.supplier || item.supplier === 'N/A') return 'N/A';
    if (typeof item.supplier === 'object') return item.supplier.name || 'N/A';
    const supStr = String(item.supplier);
    const found = suppliersList.find((s) => s.id === supStr || s._id === supStr || s.name === supStr);
    return found ? found.name : supStr;
  };
  const getBinLocation = (item) => item?.binLocation || item?.location || 'A-1-1';
  
  const formatLogDate = (val) => {
    if (!val) return 'Recorded';
    const d = new Date(val);
    return isNaN(d.getTime()) ? String(val) : d.toLocaleString();
  };

  const appendAuditLog = (action, details) => {
    const newEntry = {
      _id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      action,
      role: userRole || 'Admin',
      details
    };
    const nextLogs = [newEntry, ...auditLogs];
    setAuditLogs(nextLogs);
    localStorage.setItem('cached_audit_logs', JSON.stringify(nextLogs));
  };

  // ================= DUAL-PERSISTENCE INVENTORY ACTIONS =================
  const handleUpdateStockQty = async (item) => {
    const displayName = getItemName(item);
    const inputVal = prompt(`Enter new quantity for ${displayName}:`, item.quantity);
    if (inputVal === null || inputVal.trim() === '' || isNaN(inputVal)) return;

    const parsedQty = Math.max(0, parseInt(inputVal, 10));
    const previousQty = item.quantity;
    
    const updatedList = inventoryList.map((i) => (i._id === item._id ? { ...i, quantity: parsedQty } : i));
    setInventoryList(updatedList);
    localStorage.setItem('cached_inventory', JSON.stringify(updatedList));

    appendAuditLog('Inventory Updated', `Adjusted stock for ${displayName}: ${previousQty} -> ${parsedQty}`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: parsedQty })
      });
      if (response.ok) {
        showToast(`Saved to Cloud Database: ${displayName} quantity is now ${parsedQty}!`, 'success');
      } else {
        showToast(`Saved locally: Quantity updated to ${parsedQty}`, 'success');
      }
    } catch {
      showToast(`Saved locally (Offline Mode Active)`, 'success');
    }
  };

  const handleAddStockItem = async (e) => {
    e.preventDefault();
    if (!itemForm.name || !itemForm.quantity) return;

    const aisleLetter = itemForm.aisle.replace('Aisle ', '').trim();
    const rackNumber = itemForm.rack.replace('Rack ', '').trim();
    const binLocation = `${aisleLetter}-${rackNumber}-1`;
    const tempId = `item-${Date.now()}`;

    const newItemPayload = {
      _id: tempId,
      name: itemForm.name.trim(),
      itemName: itemForm.name.trim(),
      sku: `SKU-${aisleLetter}${rackNumber}-${Date.now().toString().slice(-4)}`,
      category: itemForm.category,
      aisle: itemForm.aisle,
      rack: itemForm.rack,
      binLocation,
      location: binLocation,
      quantity: Number(itemForm.quantity),
      minThreshold: 5,
      defects: 0,
      price: Number(itemForm.price) || 0,
      supplier: itemForm.supplier || 'Test'
    };

    const nextList = [newItemPayload, ...inventoryList];
    setInventoryList(nextList);
    localStorage.setItem('cached_inventory', JSON.stringify(nextList));

    appendAuditLog('Stock Item Added', `Added ${newItemPayload.itemName} (${newItemPayload.quantity} units) to Bin ${binLocation}`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemPayload)
      });
      if (response.ok) {
        const savedData = await response.json();
        const synchronized = nextList.map((i) => (i._id === tempId ? savedData : i));
        setInventoryList(synchronized);
        localStorage.setItem('cached_inventory', JSON.stringify(synchronized));
        showToast(`Saved to Cloud Database: Added ${newItemPayload.itemName}!`, 'success');
      } else {
        showToast(`Saved locally: Added ${newItemPayload.itemName}!`, 'success');
      }
    } catch {
      showToast(`Saved locally: Added ${newItemPayload.itemName}!`, 'success');
    }

    setItemForm({ name: '', category: 'Chairs & Seating', quantity: '', price: '', supplier: '', aisle: 'Aisle A', rack: 'Rack 1' });
  };

  const handleDeleteItem = async (id, name) => {
    if (!window.confirm(`Delete ${name} permanently?`)) return;

    const updated = inventoryList.filter((item) => item._id !== id);
    setInventoryList(updated);
    localStorage.setItem('cached_inventory', JSON.stringify(updated));

    appendAuditLog('Stock Item Deleted', `Permanently removed item: ${name}`);

    try {
      await fetch(`${API_BASE_URL}/api/inventory/${id}`, { method: 'DELETE' });
      showToast(`Deleted ${name} from Cloud Database!`, 'info');
    } catch {
      showToast(`Deleted ${name} locally!`, 'info');
    }
  };

  const handleOpenDefect = (item) => {
    setSelectedDefectItem(item);
    setDefectReason('');
    setDefectPhoto(null);
    setIsDefectModalOpen(true);
  };

  const handleSubmitDefect = (e) => {
    e.preventDefault();
    if (!selectedDefectItem || !defectReason) return;
    const itemName = getItemName(selectedDefectItem);
    const newDefectEntry = { id: `def-${Date.now()}`, name: itemName, reason: defectReason, photo: defectPhoto, reporter: username, action: 'Flagged for Inspection', date: new Date().toLocaleDateString() };
    setDefectiveLogs([newDefectEntry, ...defectiveLogs]);
    
    const updated = inventoryList.map((item) => item._id === selectedDefectItem._id ? { ...item, defects: (Number(item.defects) || 0) + 1 } : item);
    setInventoryList(updated);
    localStorage.setItem('cached_inventory', JSON.stringify(updated));

    appendAuditLog('Defect Flagged', `Flagged defect for ${itemName}: "${defectReason}"`);

    showToast(`Defect flagged for ${itemName}!`, 'warning');
    setIsDefectModalOpen(false);
  };

  const handleExportCSV = () => {
    const headers = ['Item Name,Category,Bin Location,Stock Qty,Defects,Unit Price,Supplier\n'];
    const rows = inventoryList.map((item) => `"${getItemName(item)}","${item.category}","${getBinLocation(item)}",${item.quantity},${item.defects || 0},${item.price || 0},"${getSupplierName(item)}"`);
    const csvBlob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv' });
    const url = window.URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Inventory_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
    showToast('Inventory CSV Report downloaded!', 'success');
  };

  const handleScanSuccess = async (decodedText) => {
    playScanBeep();
    setIsScannerOpen(false);
    let parsedItemName = decodedText;
    try {
      const parsed = JSON.parse(decodedText);
      if (parsed.name) parsedItemName = parsed.name;
    } catch {}

    const matchedItem = inventoryList.find((i) => getItemName(i).toLowerCase().includes(parsedItemName.toLowerCase()) || getBinLocation(i).toLowerCase() === parsedItemName.toLowerCase());
    if (matchedItem) {
      setInventorySearch(getItemName(matchedItem));
      const confirmAdd = window.confirm(`🎯 Tag Verified: ${getItemName(matchedItem)} (Bin: ${getBinLocation(matchedItem)})\n\nAdd +1 to current storage stock?`);
      if (confirmAdd) {
        const nextQty = (Number(matchedItem.quantity) || 0) + 1;
        const updated = inventoryList.map((i) => (i._id === matchedItem._id ? { ...i, quantity: nextQty } : i));
        setInventoryList(updated);
        localStorage.setItem('cached_inventory', JSON.stringify(updated));

        appendAuditLog('Quick Stock Restocked', `Scan-incremented ${getItemName(matchedItem)} (+1 -> ${nextQty})`);

        try {
          await fetch(`${API_BASE_URL}/api/inventory/${matchedItem._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity: nextQty }) });
          showToast(`Stock saved: +1 added to ${getItemName(matchedItem)}!`, 'success');
        } catch {
          showToast(`Stock updated locally!`, 'success');
        }
      }
    } else {
      setInventorySearch(decodedText);
      showToast(`Scanned Tag: ${decodedText}`, 'info');
    }
  };

  const handleRecommendBin = () => {
    let bin = 'D-1-1';
    if (putawayCategory.includes('Chairs')) bin = 'A-2-1';
    else if (putawayCategory.includes('Tables')) bin = 'B-1-1';
    else if (putawayCategory.includes('Storage')) bin = 'C-1-1';
    setRecommendedBin(bin);
    showToast(`Optimal Bin Assigned: ${bin}`, 'info');
  };

  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (!supplierForm.name) return;
    const newSup = { id: `SUP-0${suppliersList.length + 1}`, name: supplierForm.name.trim(), contactPerson: supplierForm.contactPerson.trim(), email: supplierForm.email.trim(), phone: supplierForm.phone.trim(), address: supplierForm.address.trim(), rating: '5.0', leadTime: '2-3 Days' };
    setSuppliersList([...suppliersList, newSup]);
    appendAuditLog('Supplier Registered', `Registered vendor: ${newSup.name}`);
    showToast(`Supplier ${newSup.name} registered!`, 'success');
    setSupplierForm({ name: '', contactPerson: '', email: '', phone: '', address: '' });
  };

  const handleDeleteSupplier = (id, name) => {
    if (!window.confirm('Delete this supplier record?')) return;
    setSuppliersList(suppliersList.filter((s) => s.id !== id && s._id !== id));
    appendAuditLog('Supplier Removed', `Removed vendor: ${name}`);
    showToast(`Supplier ${name} removed.`, 'info');
  };

  const handlePoItemSelect = (itemName) => {
    const found = inventoryList.find((i) => getItemName(i) === itemName);
    setPoForm({ ...poForm, selectedItemName: itemName, assignedSupplier: found ? getSupplierName(found) : 'N/A', unitPrice: found ? Number(found.price) || 0 : 0 });
  };

  const handleSubmitPurchaseOrder = (e) => {
    e.preventDefault();
    if (!poForm.selectedItemName || !poForm.quantity) return;
    const totalCalc = Number(poForm.quantity) * Number(poForm.unitPrice);
    const newPo = { id: `PO-${Date.now().toString().slice(-4)}`, date: new Date().toLocaleDateString(), itemName: poForm.selectedItemName, supplier: poForm.assignedSupplier, quantity: Number(poForm.quantity), totalPrice: totalCalc, status: 'Pending' };
    setOrdersList([newPo, ...ordersList]);
    appendAuditLog('Purchase Order Created', `Created PO ${newPo.id} for ${newPo.quantity} units of ${newPo.itemName}`);
    showToast(`Purchase Order ${newPo.id} submitted!`, 'success');
    setPoForm({ selectedItemName: '', assignedSupplier: 'N/A', quantity: '', unitPrice: 0 });
  };

  const handleApprovePo = (id) => {
    setOrdersList(ordersList.map((po) => (po.id === id ? { ...po, status: 'Approved' } : po)));
    appendAuditLog('Purchase Order Approved', `Authorized and approved PO ${id}`);
    showToast(`PO ${id} approved!`, 'success');
  };

  const handleCancelPo = (id) => {
    setOrdersList(ordersList.map((po) => (po.id === id ? { ...po, status: 'Cancelled' } : po)));
    appendAuditLog('Purchase Order Cancelled', `Cancelled restock PO ${id}`);
    showToast(`PO ${id} cancelled.`, 'info');
  };

  const handleAutoGeneratePO = () => {
    if (lowStockItems.length === 0) { showToast('All items are above safe limits.', 'info'); return; }
    const newOrders = lowStockItems.map((item, idx) => ({ id: `PO-AUTO-${100 + idx}`, date: new Date().toLocaleDateString(), itemName: getItemName(item), supplier: getSupplierName(item), quantity: (Number(item.minThreshold) || 5) * 2, totalPrice: ((Number(item.minThreshold) || 5) * 2) * (Number(item.price) || 1000), status: 'Pending' }));
    setOrdersList([...newOrders, ...ordersList]);
    appendAuditLog('Automated Restock Executed', `Generated ${newOrders.length} emergency restock order(s)`);
    showToast(`Generated ${newOrders.length} pending PO(s)!`, 'success');
  };

  const lowStockItems = Array.isArray(inventoryList) ? inventoryList.filter((item) => (Number(item.quantity) || 0) <= (Number(item.minThreshold) || 5)) : [];
  const totalInventoryAssetValue = inventoryList.reduce((acc, curr) => acc + (Number(curr.price) || 0) * (Number(curr.quantity) || 0), 0);
  const totalCommittedPO = ordersList.reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);
  const budgetPercentage = Math.min(100, Math.round((totalCommittedPO / MONTHLY_BUDGET) * 100));

  const categorySummary = inventoryList.reduce((acc, item) => {
    const cat = item.category || 'General';
    acc[cat] = (acc[cat] || 0) + (Number(item.price) || 0) * (Number(item.quantity) || 0);
    return acc;
  }, {});

  const TOTAL_WAREHOUSE_SLOTS = 16;
  const occupiedSlotsCount = 1;
  const warehouseOccupancyPct = Math.round((occupiedSlotsCount / TOTAL_WAREHOUSE_SLOTS) * 100);

  // Modern Cohesive Theme Palette
  const themeStyles = {
    bgWorkspace: isDarkMode ? '#0b1120' : '#f8fafc',
    cardBg: isDarkMode ? '#131c2e' : '#ffffff',
    cardBorder: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    cardShadow: isDarkMode ? '0 4px 20px rgba(0, 0, 0, 0.35)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
    textPrimary: isDarkMode ? '#f8fafc' : '#0f172a',
    textSecondary: isDarkMode ? '#94a3b8' : '#64748b',
    tableHeaderBg: isDarkMode ? '#0b1322' : '#f8fafc',
    tableBorder: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : '#f1f5f9',
    inputBg: isDarkMode ? '#0e1626' : '#ffffff',
    inputBorder: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1'
  };

  const filteredCatalog = (Array.isArray(inventoryList) ? inventoryList : []).filter((item) => {
    if (!item) return false;
    const nameMatch = String(getItemName(item)).toLowerCase().includes(String(inventorySearch || '').toLowerCase());
    const categoryMatch = inventoryCategoryFilter === 'All Categories' || String(item.category || '') === String(inventoryCategoryFilter);
    return nameMatch && categoryMatch;
  });

  return (
    <div className="dashboard-container" style={{ backgroundColor: themeStyles.bgWorkspace, minHeight: '100vh', transition: 'background-color 0.3s ease' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{ position: 'fixed', top: '24px', right: '28px', zIndex: 99999, display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '10px', backgroundColor: '#0f172a', color: '#ffffff', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', borderLeft: `5px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'warning' ? '#f59e0b' : '#3b82f6'}`, fontSize: '13px', fontWeight: '600' }}>
          <span>{toast.type === 'success' ? '✓' : toast.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px', marginLeft: '8px' }}>&times;</button>
        </div>
      )}

      {/* Sidebar with Circular Emblem Logo & Profile Card */}
      <aside className="sidebar">
        {/* Brand Logo Section - Swak at Pantay na Alignment */}
        <div
          className="sidebar-brand"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '4px 0 16px 0',
            marginBottom: '16px'
          }}
        >
          {/* Circular Emblem Badge */}
          <div
            style={{
              width: '44px',
              height: '44px',
              minWidth: '44px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '2px solid rgba(16, 185, 129, 0.45)',
              boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <img
              src={customLogo}
              alt="System Logo"
              style={{
                width: '88%',
                height: '88%',
                objectFit: 'contain'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '1.05rem', fontWeight: '900', color: '#10b981', letterSpacing: '-0.3px', lineHeight: '1.2' }}>
              Supply Chain
            </div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: '2px' }}>
              Management System
            </div>
          </div>
        </div>

        {/* Executive User Profile Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              color: '#ffffff',
              fontSize: '15px',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)'
            }}
          >
            {(username || 'User').charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {username || 'Administrator'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                {isAdmin ? 'System Admin' : isProcurement ? 'Procurement' : 'Warehouse Staff'}
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button type="button" className={`sidebar-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          {(isAdmin || isWarehouse) && <button type="button" className={`sidebar-nav-item ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>Inventory Management</button>}
          {(isAdmin || isWarehouse) && <button type="button" className={`sidebar-nav-item ${activeTab === 'warehouse-map' ? 'active' : ''}`} onClick={() => setActiveTab('warehouse-map')}>2D Warehouse Floor Map</button>}
          {(isAdmin || isProcurement) && <button type="button" className={`sidebar-nav-item ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')}>Supplier Management</button>}
          {(isAdmin || isProcurement) && <button type="button" className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>Purchase Orders</button>}
          <button type="button" className={`sidebar-nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
            <span>Alerts Center</span>
            {lowStockItems.length > 0 && <span style={{ backgroundColor: '#ef4444', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px' }}>{lowStockItems.length}</span>}
          </button>
          {isAdmin && <button type="button" className={`sidebar-nav-item ${activeTab === 'audit-logs' ? 'active' : ''}`} onClick={() => setActiveTab('audit-logs')}>System Audit Logs</button>}
        </nav>

        {/* Modern Segmented Dual Pill Switcher */}
        <div
          style={{
            marginTop: 'auto',
            marginBottom: '12px',
            padding: '4px',
            borderRadius: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.28)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            gap: '4px'
          }}
        >
          <button
            type="button"
            onClick={() => isDarkMode && setThemeMode(false)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 0',
              borderRadius: '7px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              backgroundColor: !isDarkMode ? '#ffffff' : 'transparent',
              color: !isDarkMode ? '#0f172a' : '#94a3b8',
              boxShadow: !isDarkMode ? '0 2px 6px rgba(0,0,0,0.25)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>☀️</span> Light
          </button>
          <button
            type="button"
            onClick={() => !isDarkMode && setThemeMode(true)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 0',
              borderRadius: '7px',
              border: 'none',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              backgroundColor: isDarkMode ? '#10b981' : 'transparent',
              color: isDarkMode ? '#ffffff' : '#94a3b8',
              boxShadow: isDarkMode ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>🌙</span> Dark
          </button>
        </div>

        <button type="button" className="btn-signout" onClick={handleSignOut}>Sign Out</button>
      </aside>

      {/* Main Workspace */}
      <main className="main-content" style={{ backgroundColor: themeStyles.bgWorkspace, transition: 'all 0.3s ease' }}>
        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div>
            <header className="dashboard-header" style={{ marginBottom: '20px' }}>
              <div>
                <h1 style={{ color: themeStyles.textPrimary, margin: '0 0 6px 0' }}>Dashboard Overview</h1>
                <h3 style={{ fontSize: '18px', margin: '0 0 4px 0', fontWeight: '800', color: themeStyles.textPrimary }}>Welcome back!</h3>
                <p style={{ color: themeStyles.textSecondary, fontSize: '14px', margin: 0 }}>Signed in with {userRole} privileges.</p>
              </div>
            </header>

            {lowStockItems.length > 0 && (
              <div className="alert-banner">
                <div>
                  <div style={{ color: '#991b1b', fontWeight: '700', fontSize: '15px' }}>⚠️ System Alerts Detected!</div>
                  <div style={{ color: '#b91c1c', fontSize: '13px', marginTop: '4px' }}>{lowStockItems.length} items low on stock | {defectiveLogs.length} items flagged with defect records.</div>
                </div>
                <button type="button" className="alert-btn" onClick={() => setActiveTab('alerts')}>View Alert Center</button>
              </div>
            )}

            <section className="stats-grid" style={{ marginBottom: '28px' }}>
              <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '20px 24px', border: `1px solid ${themeStyles.cardBorder}`, borderLeft: '5px solid #3b82f6', boxShadow: themeStyles.cardShadow }}>
                <div style={{ color: themeStyles.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Stock Items</div>
                <div style={{ color: themeStyles.textPrimary, fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>{inventoryList.length}</div>
              </div>
              <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '20px 24px', border: `1px solid ${themeStyles.cardBorder}`, borderLeft: '5px solid #8b5cf6', boxShadow: themeStyles.cardShadow }}>
                <div style={{ color: themeStyles.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Suppliers</div>
                <div style={{ color: themeStyles.textPrimary, fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>{suppliersList.length}</div>
              </div>
              <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '20px 24px', border: `1px solid ${themeStyles.cardBorder}`, borderLeft: '5px solid #10b981', boxShadow: themeStyles.cardShadow }}>
                <div style={{ color: themeStyles.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Asset Value</div>
                <div style={{ color: themeStyles.textPrimary, fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>₱{totalInventoryAssetValue.toLocaleString()}.00</div>
              </div>
              <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '20px 24px', border: `1px solid ${themeStyles.cardBorder}`, borderLeft: '5px solid #ef4444', boxShadow: themeStyles.cardShadow }}>
                <div style={{ color: themeStyles.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Low Stock Alerts</div>
                <div style={{ color: themeStyles.textPrimary, fontSize: '28px', fontWeight: '800', marginTop: '6px' }}>{lowStockItems.length}</div>
              </div>
            </section>

            <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '12px', padding: '24px', border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>📈 Inventory Valuation & Stock Distribution by Category</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: themeStyles.textSecondary }}>Proportional asset share across warehouse storage zones.</p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '4px 10px', borderRadius: '20px' }}>Real-time Asset Share</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(categorySummary).map(([category, val], idx) => {
                  const percent = totalInventoryAssetValue > 0 ? Math.round((val / totalInventoryAssetValue) * 100) : 0;
                  const barColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
                  return (
                    <div key={category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                        <span style={{ color: themeStyles.textPrimary }}>{category}</span>
                        <span style={{ color: themeStyles.textSecondary }}>₱{val.toLocaleString()}.00 ({percent}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '9px', backgroundColor: isDarkMode ? '#0b1322' : '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: barColors[idx % barColors.length], borderRadius: '6px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: INVENTORY CATALOG ================= */}
        {activeTab === 'inventory' && (isAdmin || isWarehouse) && (
          <div>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>Furniture Inventory Catalog</h1>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setIsScannerOpen(true)} style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '7px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📷</span> Scan Tag
                </button>
                <button type="button" onClick={handleExportCSV} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '7px', fontWeight: '600', cursor: 'pointer' }}>
                  Export CSV Report
                </button>
              </div>
            </header>

            <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '22px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '32px', boxShadow: themeStyles.cardShadow }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>Add Furniture Item with Storage Bin</h3>
              <form onSubmit={handleAddStockItem}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
                  <input type="text" placeholder="Item Name *" className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
                  <select className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}>
                    <option value="Chairs & Seating">Chairs & Seating</option>
                    <option value="Tables & Desks">Tables & Desks</option>
                    <option value="Storage & Shelving">Storage & Shelving</option>
                    <option value="Beds & Mattresses">Beds & Mattresses</option>
                  </select>
                  <input type="number" placeholder="Quantity Stock *" className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} required />
                  <input type="number" placeholder="Unit Price (₱) *" className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '18px' }}>
                  <select className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={itemForm.supplier} onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}>
                    <option value="">-- Select Supplier * --</option>
                    {suppliersList.map((sup) => (<option key={sup.id || sup._id} value={sup.name}>{sup.name}</option>))}
                  </select>
                  <select className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={itemForm.aisle} onChange={(e) => setItemForm({ ...itemForm, aisle: e.target.value })}>
                    <option value="Aisle A">Aisle A</option>
                    <option value="Aisle B">Aisle B</option>
                    <option value="Aisle C">Aisle C</option>
                    <option value="Aisle D">Aisle D</option>
                  </select>
                  <select className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={itemForm.rack} onChange={(e) => setItemForm({ ...itemForm, rack: e.target.value })}>
                    <option value="Rack 1">Rack 1</option>
                    <option value="Rack 2">Rack 2</option>
                    <option value="Rack 3">Rack 3</option>
                    <option value="Rack 4">Rack 4</option>
                  </select>
                </div>
                <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '7px', fontWeight: '700', cursor: 'pointer' }}>Add Stock Item</button>
              </form>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: themeStyles.textPrimary }}>Current Stock Catalog</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input type="text" placeholder="Search item..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${themeStyles.cardBorder}`, fontSize: '13px', outline: 'none', backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary }} />
                  <select value={inventoryCategoryFilter} onChange={(e) => setInventoryCategoryFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${themeStyles.cardBorder}`, fontSize: '13px', backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary }}>
                    <option value="All Categories">All Categories</option>
                    <option value="Chairs & Seating">Chairs & Seating</option>
                    <option value="Tables & Desks">Tables & Desks</option>
                    <option value="Storage & Shelving">Storage & Shelving</option>
                    <option value="Beds & Mattresses">Beds & Mattresses</option>
                  </select>
                </div>
              </div>

              <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto', boxShadow: themeStyles.cardShadow }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: themeStyles.tableHeaderBg, borderBottom: `1px solid ${themeStyles.cardBorder}`, color: themeStyles.textSecondary }}>
                      <th style={{ padding: '14px 18px', fontWeight: '700' }}>Item Name</th>
                      <th style={{ padding: '14px 18px', fontWeight: '700' }}>Category</th>
                      <th style={{ padding: '14px 18px', fontWeight: '700' }}>Bin Location</th>
                      <th style={{ padding: '14px 18px', fontWeight: '700' }}>Stock Status & Qty</th>
                      <th style={{ padding: '14px 18px', fontWeight: '700' }}>Defects</th>
                      <th style={{ padding: '14px 18px', fontWeight: '700' }}>Unit Price</th>
                      <th style={{ padding: '14px 18px', fontWeight: '700' }}>Supplier</th>
                      <th style={{ padding: '14px 18px', fontWeight: '700', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCatalog.map((item, idx) => {
                      const displayName = getItemName(item);
                      const qtyNum = Number(item.quantity) || 0;
                      const threshold = Number(item.minThreshold) || 5;
                      const isOutOfStock = qtyNum === 0;
                      const isLowStock = !isOutOfStock && qtyNum <= threshold;

                      return (
                        <tr key={item._id || idx} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
                          <td style={{ padding: '14px 18px', fontWeight: '700', color: themeStyles.textPrimary }}>{displayName}</td>
                          <td style={{ padding: '14px 18px', color: themeStyles.textSecondary }}>{String(item.category || 'General')}</td>
                          <td style={{ padding: '14px 18px', color: themeStyles.textPrimary, fontWeight: '600' }}>{getBinLocation(item)}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontWeight: '800', fontSize: '14px', color: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : themeStyles.textPrimary }}>
                                {qtyNum}
                              </span>
                              {isOutOfStock ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                                  <span className="status-dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 6px #ef4444' }} />
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
                                  Low Stock
                                </span>
                              ) : (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                                  In Stock
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', color: Number(item.defects) > 0 ? '#b91c1c' : themeStyles.textSecondary, fontWeight: '700' }}>{item.defects || 0}</td>
                          <td style={{ padding: '14px 18px', fontWeight: '600', color: themeStyles.textPrimary }}>₱{(Number(item.price) || 0).toLocaleString()}</td>
                          <td style={{ padding: '14px 18px', color: themeStyles.textSecondary }}>{getSupplierName(item)}</td>
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button type="button" onClick={() => { setSelectedQrItem(item); setIsQrModalOpen(true); }} style={{ padding: '5px 9px', backgroundColor: '#8b5cf6', color: '#ffffff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>QR</button>
                              <button type="button" onClick={() => handleUpdateStockQty(item)} style={{ padding: '5px 9px', backgroundColor: '#eab308', color: '#ffffff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Qty</button>
                              <button type="button" onClick={() => handleOpenDefect(item)} style={{ padding: '5px 9px', backgroundColor: '#f97316', color: '#ffffff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Defect</button>
                              <button type="button" onClick={() => handleDeleteItem(item._id, displayName)} style={{ padding: '5px 9px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>Del</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: 2D FLOOR MAP ================= */}
        {activeTab === 'warehouse-map' && (isAdmin || isWarehouse) && (
          <div>
            <header className="dashboard-header" style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>Digital 2D Warehouse Floor Map & Putaway</h1>
            </header>

            <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '18px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '24px', boxShadow: themeStyles.cardShadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: themeStyles.textPrimary }}>📦 Total Warehouse Storage Slot Utilization</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>{occupiedSlotsCount} / {TOTAL_WAREHOUSE_SLOTS} Bins Occupied ({warehouseOccupancyPct}% Capacity)</span>
              </div>
              <div style={{ width: '100%', height: '9px', backgroundColor: isDarkMode ? '#0b1322' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${warehouseOccupancyPct}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '5px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            <div style={{ backgroundColor: themeStyles.cardBg, borderLeft: '5px solid #4f46e5', border: `1px solid ${themeStyles.cardBorder}`, borderRadius: '10px', padding: '20px 24px', marginBottom: '28px', boxShadow: themeStyles.cardShadow }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>
                <span>🎯</span> Directed Putaway Recommendation Engine
              </div>
              <p style={{ margin: '6px 0 14px 0', fontSize: '13px', color: themeStyles.textSecondary }}>Select an incoming product category to query MongoDB for the optimal, nearest empty storage bin:</p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <select value={putawayCategory} onChange={(e) => setPutawayCategory(e.target.value)} style={{ padding: '9px 14px', borderRadius: '7px', border: `1px solid ${themeStyles.cardBorder}`, fontSize: '13px', backgroundColor: themeStyles.inputBg, color: themeStyles.textPrimary, minWidth: '240px' }}>
                  <option value="Chairs & Seating (Zone A)">Chairs & Seating (Zone A)</option>
                  <option value="Tables & Desks (Zone B)">Tables & Desks (Zone B)</option>
                  <option value="Storage & Shelving (Zone C)">Storage & Shelving (Zone C)</option>
                  <option value="Beds & Mattresses (Zone D)">Beds & Mattresses (Zone D)</option>
                </select>
                <button type="button" onClick={handleRecommendBin} style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '7px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Recommend Storage Bin</button>
                {recommendedBin && <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a', marginLeft: '8px' }}>Recommended Target: Bin {recommendedBin}</span>}
              </div>
            </div>

            <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '24px', border: `1px solid ${themeStyles.cardBorder}`, boxShadow: themeStyles.cardShadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: themeStyles.textPrimary }}>Warehouse 2D Storage Rack Layout</h3>
                <div style={{ display: 'flex', gap: '18px', fontSize: '12px', color: themeStyles.textSecondary }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} /> Occupied Bin</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', backgroundColor: isDarkMode ? '#0b1322' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px' }} /> Empty Bin</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#fbbf24', borderRadius: '2px' }} /> Recommended Putaway Target</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                  { code: 'A', title: 'Aisle A (Chairs)' },
                  { code: 'B', title: 'Aisle B (Tables)' },
                  { code: 'C', title: 'Aisle C (Storage)' },
                  { code: 'D', title: 'Aisle D (Beds)' }
                ].map((aisle) => (
                  <div key={aisle.code} style={{ backgroundColor: isDarkMode ? '#0b1322' : '#f8fafc', padding: '16px', borderRadius: '8px', border: `1px solid ${themeStyles.cardBorder}` }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: themeStyles.textPrimary, marginBottom: '14px', textAlign: 'center' }}>{aisle.title}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {[1, 2, 3, 4].map((rackNum) => {
                        const binCode = `${aisle.code}-${rackNum}-1`;
                        const isOccupied = binCode === 'A-1-1';
                        const isTarget = recommendedBin === binCode;
                        return (
                          <div key={binCode} style={{ padding: '16px 8px', textAlign: 'center', borderRadius: '6px', backgroundColor: isTarget ? '#fef3c7' : isOccupied ? (isDarkMode ? '#064e3b' : '#ecfdf5') : themeStyles.cardBg, border: `2px solid ${isTarget ? '#f59e0b' : isOccupied ? '#10b981' : themeStyles.cardBorder}` }}>
                            <div style={{ fontSize: '11px', color: themeStyles.textSecondary }}>Rack {rackNum}</div>
                            <div style={{ fontWeight: '800', color: themeStyles.textPrimary, fontSize: '13px', margin: '4px 0' }}>{binCode}</div>
                            <div style={{ fontSize: '10px', color: isOccupied ? '#10b981' : themeStyles.textSecondary, fontWeight: isOccupied ? '700' : 'normal' }}>{isOccupied ? 'Test Chair...' : 'Empty Slot'}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: SUPPLIERS ================= */}
        {activeTab === 'suppliers' && (isAdmin || isProcurement) && (
          <div>
            <header className="dashboard-header" style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>Supplier & Vendor Database</h1>
            </header>

            <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '22px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '32px', boxShadow: themeStyles.cardShadow }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>Add New Supplier</h3>
              <form onSubmit={handleSaveSupplier}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
                  <input type="text" placeholder="Company Name *" className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
                  <input type="text" placeholder="Contact Person *" className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={supplierForm.contactPerson} onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })} required />
                  <input type="email" placeholder="Email Address *" className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                  <input type="tel" placeholder="Contact Number *" className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} required />
                  <input type="text" placeholder="Business Address *" className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} required />
                </div>
                <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '7px', fontWeight: '700', cursor: 'pointer' }}>Save Supplier</button>
              </form>
            </div>

            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: themeStyles.textPrimary }}>Active Suppliers</h3>
              <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto', boxShadow: themeStyles.cardShadow }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: themeStyles.tableHeaderBg, borderBottom: `1px solid ${themeStyles.cardBorder}`, color: themeStyles.textSecondary }}>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Company</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Contact Person</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Email & Phone</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Performance</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Address</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliersList.map((sup) => (
                      <tr key={sup.id || sup._id} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
                        <td style={{ padding: '14px 20px', fontWeight: '700', color: themeStyles.textPrimary }}>{sup.name}</td>
                        <td style={{ padding: '14px 20px', color: themeStyles.textPrimary }}>{sup.contactPerson}</td>
                        <td style={{ padding: '14px 20px', color: themeStyles.textSecondary }}>
                          <div>{sup.email}</div>
                          <div style={{ fontSize: '12px' }}>{sup.phone}</div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ color: '#eab308', fontWeight: '700', fontSize: '13px' }}>★ {sup.rating || '4.8'}</span>
                          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', marginTop: '2px' }}>{sup.leadTime || '2-3 Days'}</div>
                        </td>
                        <td style={{ padding: '14px 20px', color: themeStyles.textSecondary }}>{sup.address}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <button type="button" onClick={() => handleDeleteSupplier(sup.id || sup._id, sup.name)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: PURCHASE ORDERS ================= */}
        {activeTab === 'orders' && (isAdmin || isProcurement) && (
          <div>
            <header className="dashboard-header" style={{ marginBottom: '20px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>Purchase Orders & Restocking</h1>
            </header>

            <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '18px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '26px', boxShadow: themeStyles.cardShadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: themeStyles.textPrimary }}>📊 Monthly Restocking Budget Utilization</span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: budgetPercentage > 85 ? '#dc2626' : '#2563eb' }}>₱{totalCommittedPO.toLocaleString()}.00 / ₱{MONTHLY_BUDGET.toLocaleString()}.00 ({budgetPercentage}%)</span>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: isDarkMode ? '#0b1322' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${budgetPercentage}%`, height: '100%', backgroundColor: budgetPercentage > 85 ? '#ef4444' : budgetPercentage > 60 ? '#f59e0b' : '#10b981', borderRadius: '5px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '22px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '32px', boxShadow: themeStyles.cardShadow }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>Create Purchase Order (Reorder)</h3>
              <form onSubmit={handleSubmitPurchaseOrder}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
                  <select className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={poForm.selectedItemName} onChange={(e) => handlePoItemSelect(e.target.value)} required>
                    <option value="">-- Select Item to Restock * --</option>
                    {inventoryList.map((item, idx) => (
                      <option key={item._id || idx} value={getItemName(item)}>{getItemName(item)} (Current: {item.quantity})</option>
                    ))}
                  </select>
                  <input type="text" className="form-input" value={poForm.assignedSupplier ? `-- Assigned Supplier: ${poForm.assignedSupplier} --` : '-- Assigned Supplier --'} disabled style={{ backgroundColor: isDarkMode ? '#0b1322' : '#f1f5f9', borderColor: themeStyles.inputBorder, cursor: 'not-allowed', color: themeStyles.textSecondary }} />
                  <input type="number" placeholder="Order Quantity *" className="form-input" style={{ backgroundColor: themeStyles.inputBg, borderColor: themeStyles.inputBorder, color: themeStyles.textPrimary }} value={poForm.quantity} onChange={(e) => setPoForm({ ...poForm, quantity: e.target.value })} required />
                </div>
                <div style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700', color: themeStyles.textPrimary }}>Total: ₱{((Number(poForm.quantity) || 0) * (Number(poForm.unitPrice) || 0)).toFixed(2)}</div>
                <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '7px', fontWeight: '700', cursor: 'pointer' }}>Submit Purchase Order</button>
              </form>
            </div>

            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: themeStyles.textPrimary }}>Purchase Order History</h3>
              <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto', boxShadow: themeStyles.cardShadow }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: themeStyles.tableHeaderBg, borderBottom: `1px solid ${themeStyles.cardBorder}`, color: themeStyles.textSecondary }}>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Date</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Item</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Supplier</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Quantity</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Total Price</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList.map((po, idx) => (
                      <tr key={po.id || idx} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
                        <td style={{ padding: '14px 20px', color: themeStyles.textSecondary }}>{po.date}</td>
                        <td style={{ padding: '14px 20px', fontWeight: '700', color: themeStyles.textPrimary }}>{po.itemName}</td>
                        <td style={{ padding: '14px 20px', color: themeStyles.textSecondary }}>{po.supplier}</td>
                        <td style={{ padding: '14px 20px', fontWeight: '700', color: themeStyles.textPrimary }}>{po.quantity}</td>
                        <td style={{ padding: '14px 20px', fontWeight: '700', color: themeStyles.textPrimary }}>₱{(Number(po.totalPrice) || 0).toLocaleString()}.00</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: po.status === 'Approved' ? '#dcfce7' : po.status === 'Cancelled' ? '#fee2e2' : '#fef3c7', color: po.status === 'Approved' ? '#15803d' : po.status === 'Cancelled' ? '#b91c1c' : '#b45309' }}>{po.status}</span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {po.status === 'Pending' && (
                              <>
                                <button type="button" onClick={() => handleApprovePo(po.id)} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Approve</button>
                                <button type="button" onClick={() => handleCancelPo(po.id)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                              </>
                            )}
                            <button type="button" onClick={() => { setSelectedPoForPrint(po); setIsPoPrintModalOpen(true); }} style={{ backgroundColor: '#475569', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Print Slip</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: ALERTS CENTER ================= */}
        {activeTab === 'alerts' && (
          <div>
            <header className="dashboard-header" style={{ marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>Automated Warning & Alert Center</h1>
            </header>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: themeStyles.cardBg, borderLeft: '5px solid #f97316', border: `1px solid ${themeStyles.cardBorder}`, borderRadius: '10px', padding: '20px 24px', marginBottom: '32px', boxShadow: themeStyles.cardShadow }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>
                  <span>⚡</span> Automated Purchase Order Generator
                </div>
                <div style={{ fontSize: '13px', color: themeStyles.textSecondary, marginTop: '6px' }}>Click below to automatically create pending Purchase Orders for all items currently below their reorder thresholds.</div>
              </div>
              <button type="button" onClick={handleAutoGeneratePO} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Auto-Generate Restock POs</button>
            </div>

            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '16px' }}>📉</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#b91c1c' }}>Low Stock Warning Flags ({lowStockItems.length})</h3>
              </div>

              <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto', boxShadow: themeStyles.cardShadow }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ backgroundColor: themeStyles.tableHeaderBg, borderBottom: `1px solid ${themeStyles.cardBorder}`, color: themeStyles.textSecondary }}>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Item Name</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Current Stock</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Threshold</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Assigned Supplier</th>
                      <th style={{ padding: '14px 20px', fontWeight: '700' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.length > 0 ? (
                      lowStockItems.map((item, idx) => (
                        <tr key={item._id || idx} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
                          <td style={{ padding: '14px 20px', fontWeight: '600', color: themeStyles.textPrimary }}>{getItemName(item)}</td>
                          <td style={{ padding: '14px 20px', fontWeight: '800', color: '#ef4444' }}>{item.quantity}</td>
                          <td style={{ padding: '14px 20px', color: themeStyles.textSecondary }}>{item.minThreshold || 5}</td>
                          <td style={{ padding: '14px 20px', color: themeStyles.textSecondary }}>{getSupplierName(item)}</td>
                          <td style={{ padding: '14px 20px' }}><span style={{ fontStyle: 'italic', color: '#b91c1c', fontWeight: '600' }}>Reorder Needed</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: themeStyles.textSecondary }}>No low stock warning flags detected.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px' }}>🔨</span>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#b45309' }}>Defective Item Warning Logs ({defectiveLogs.length})</h3>
              </div>
              {defectiveLogs.length === 0 ? (
                <p style={{ color: themeStyles.textSecondary, fontSize: '14px', margin: 0, paddingLeft: '4px' }}>No defective or damaged items currently logged.</p>
              ) : (
                <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto', boxShadow: themeStyles.cardShadow }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: themeStyles.tableHeaderBg, borderBottom: `1px solid ${themeStyles.cardBorder}`, color: themeStyles.textSecondary }}>
                        <th style={{ padding: '14px 20px' }}>Photo</th>
                        <th style={{ padding: '14px 20px' }}>Item Name</th>
                        <th style={{ padding: '14px 20px' }}>Defect Reason</th>
                        <th style={{ padding: '14px 20px' }}>Reported By</th>
                        <th style={{ padding: '14px 20px' }}>Action Taken</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defectiveLogs.map((log, index) => (
                        <tr key={index} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
                          <td style={{ padding: '10px 20px' }}>
                            {log.photo ? <img src={log.photo} alt="Proof" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} /> : <span style={{ fontSize: '12px', color: '#94a3b8' }}>No Photo</span>}
                          </td>
                          <td style={{ padding: '14px 20px', fontWeight: '600', color: themeStyles.textPrimary }}>{log.name}</td>
                          <td style={{ padding: '14px 20px', color: '#ef4444' }}>{log.reason}</td>
                          <td style={{ padding: '14px 20px', color: themeStyles.textSecondary }}>{log.reporter}</td>
                          <td style={{ padding: '14px 20px', color: themeStyles.textPrimary }}>{log.action}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 7: SYSTEM AUDIT LOGS ================= */}
        {activeTab === 'audit-logs' && isAdmin && (
          <div>
            <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>System Activity Audit Logs</h1>
                <p style={{ color: themeStyles.textSecondary, fontSize: '13px', margin: '4px 0 0 0' }}>Immutable security records of ledger events and role access.</p>
              </div>
              <button type="button" onClick={() => setIsAuditPrintModalOpen(true)} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '7px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.2)' }}>
                <span>🖨️</span> Print Audit Report
              </button>
            </header>

            <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto', boxShadow: themeStyles.cardShadow }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: themeStyles.tableHeaderBg, borderBottom: `1px solid ${themeStyles.cardBorder}`, color: themeStyles.textSecondary }}>
                    <th style={{ padding: '14px 20px', fontWeight: '700' }}>Timestamp</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700' }}>Action</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700' }}>User Role</th>
                    <th style={{ padding: '14px 20px', fontWeight: '700' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log, idx) => (
                      <tr key={log._id || log.id || idx} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
                        <td style={{ padding: '14px 20px', color: themeStyles.textSecondary, whiteSpace: 'nowrap' }}>{formatLogDate(log.timestamp || log.createdAt)}</td>
                        <td style={{ padding: '14px 20px', fontWeight: '700', color: themeStyles.textPrimary }}>{log.action}</td>
                        <td style={{ padding: '14px 20px', color: themeStyles.textSecondary }}>{log.role}</td>
                        <td style={{ padding: '14px 20px', color: themeStyles.textPrimary }}>{log.details}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ padding: '28px', textAlign: 'center', color: themeStyles.textSecondary }}>
                        No system activity audit records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        {isPoPrintModalOpen && selectedPoForPrint && (
          <div className="modal-backdrop" onClick={() => setIsPoPrintModalOpen(false)} style={{ overflowY: 'auto', padding: '20px' }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '660px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', color: '#0f172a', overflow: 'hidden' }}>
              <div className="modal-header" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '14px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: '#0f172a' }}>SUPPLY CHAIN LOGISTICS INC.</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Official Material Purchase Requisition Slip</p>
                </div>
                <button type="button" className="btn-close" onClick={() => setIsPoPrintModalOpen(false)}>&times;</button>
              </div>
              <div className="modal-body" style={{ padding: '16px 0', fontSize: '13px', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                  <div>
                    <div><strong>PO Code:</strong> {selectedPoForPrint.id}</div>
                    <div><strong>Date Issued:</strong> {selectedPoForPrint.date}</div>
                    <div><strong>Status:</strong> {selectedPoForPrint.status}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div><strong>Vendor:</strong> {selectedPoForPrint.supplier}</div>
                    <div><strong>Authorized By:</strong> {username} ({userRole})</div>
                  </div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      <th style={{ padding: '10px 14px' }}>Item Description</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: '700' }}>{selectedPoForPrint.itemName}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{selectedPoForPrint.quantity}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>₱{(selectedPoForPrint.totalPrice / (selectedPoForPrint.quantity || 1)).toLocaleString()}.00</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700' }}>₱{Number(selectedPoForPrint.totalPrice || 0).toLocaleString()}.00</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '800' }}>Grand Total:</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '900', color: '#15803d', fontSize: '15px' }}>₱{Number(selectedPoForPrint.totalPrice || 0).toLocaleString()}.00</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsPoPrintModalOpen(false)} style={{ backgroundColor: '#64748b', color: '#ffffff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                <button type="button" onClick={() => window.print()} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>🖨️ Print PO Document</button>
              </div>
            </div>
          </div>
        )}

        {isAuditPrintModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsAuditPrintModalOpen(false)} style={{ overflowY: 'auto', padding: '20px' }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', color: '#0f172a', overflow: 'hidden' }}>
              <div className="modal-header" style={{ borderBottom: '2px solid #0f172a', paddingBottom: '14px', flexShrink: 0 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '19px', fontWeight: '900', color: '#0f172a' }}>SUPPLY CHAIN LOGISTICS & AUDIT TRAIL</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>ISO-Compliant Security & Ledger Verification Report</p>
                </div>
                <button type="button" className="btn-close" onClick={() => setIsAuditPrintModalOpen(false)}>&times;</button>
              </div>
              <div className="modal-body" style={{ padding: '16px 4px 16px 0', fontSize: '13px', overflowY: 'auto', flex: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div><div><strong>Report Date:</strong> {new Date().toLocaleDateString()}</div><div><strong>Classification:</strong> Internal Security</div></div>
                  <div><div><strong>Lead Auditor:</strong> {username}</div><div><strong>Access Scope:</strong> Full RBAC Matrix</div></div>
                  <div style={{ textAlign: 'right' }}><div><strong>Total Logs:</strong> {auditLogs.length} Records</div><div style={{ color: '#16a34a', fontWeight: '700' }}>✓ Verified Ledger</div></div>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                      <th style={{ padding: '10px 12px' }}>Timestamp</th>
                      <th style={{ padding: '10px 12px' }}>Event Action</th>
                      <th style={{ padding: '10px 12px' }}>Role</th>
                      <th style={{ padding: '10px 12px' }}>Event Ledger Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>{formatLogDate(log.timestamp || log.createdAt)}</td>
                        <td style={{ padding: '10px 12px', fontWeight: '700', color: '#0f172a' }}>{log.action}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{log.role}</td>
                        <td style={{ padding: '10px 12px', color: '#334155' }}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end', gap: '10px', flexShrink: 0 }}>
                <button type="button" onClick={() => setIsAuditPrintModalOpen(false)} style={{ backgroundColor: '#64748b', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Close</button>
                <button type="button" onClick={() => window.print()} style={{ backgroundColor: '#0f172a', color: '#ffffff', border: 'none', padding: '9px 20px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>🖨️ Print Compliance Audit</button>
              </div>
            </div>
          </div>
        )}

        {isQrModalOpen && selectedQrItem && (
          <div className="modal-backdrop" onClick={() => setIsQrModalOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
              <div className="modal-header">
                <h3>QR Tag: {getItemName(selectedQrItem)}</h3>
                <button type="button" className="btn-close" onClick={() => setIsQrModalOpen(false)}>&times;</button>
              </div>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '16px', background: '#ffffff', borderRadius: '12px' }}>
                  <QRCodeSVG value={JSON.stringify({ name: getItemName(selectedQrItem), category: selectedQrItem.category, binLocation: getBinLocation(selectedQrItem), price: selectedQrItem.price })} size={190} level="H" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>{getItemName(selectedQrItem)}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Location: {getBinLocation(selectedQrItem)} | Qty: {selectedQrItem.quantity}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-primary" onClick={() => window.print()}>Print Tag</button>
              </div>
            </div>
          </div>
        )}

        {isDefectModalOpen && selectedDefectItem && (
          <div className="modal-backdrop" onClick={() => setIsDefectModalOpen(false)} style={{ overflowY: 'auto', padding: '20px' }}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <h3>Report Defective Item</h3>
                <button type="button" className="btn-close" onClick={() => setIsDefectModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmitDefect}>
                <div className="modal-body">
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155' }}>Item: <strong>{getItemName(selectedDefectItem)}</strong> (Bin: {getBinLocation(selectedDefectItem)})</p>
                  <div className="form-group" style={{ marginBottom: '14px' }}>
                    <label>Defect Description / Reason *</label>
                    <textarea rows="3" className="form-input" placeholder="e.g. Broken caster, scratched finish..." value={defectReason} onChange={(e) => setDefectReason(e.target.value)} required style={{ resize: 'none' }} />
                  </div>
                  <div className="form-group">
                    <label>Attach Damage Photo Proof (Optional)</label>
                    <input type="file" accept="image/*" className="form-input" onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setDefectPhoto(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} style={{ padding: '7px 10px', fontSize: '13px' }} />
                    {defectPhoto && (
                      <div style={{ marginTop: '10px', textAlign: 'center' }}>
                        <img src={defectPhoto} alt="Preview" style={{ maxWidth: '100%', maxHeight: '130px', objectFit: 'contain', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>✓ Photo attached and ready to log</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button type="button" onClick={() => setIsDefectModalOpen(false)} style={{ padding: '9px 16px', background: '#334155', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Submit Defect</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isScannerOpen && <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />}
      </main>
    </div>
  );
};

export default Dashboard;