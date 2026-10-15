import React from 'react';

// ================= TAB 1: OVERVIEW =================
export const OverviewTab = ({
  username,
  userRole,
  themeStyles,
  lowStockItems,
  defectiveLogs,
  setActiveTab,
  inventoryList,
  suppliersList,
  totalInventoryAssetValue,
  categorySummary,
  isDarkMode
}) => (
  <div>
    <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
      <div>
        <h1 style={{ color: themeStyles.textPrimary }}>Dashboard Overview</h1>
        <h3 style={{ fontSize: '18px', margin: '4px 0', fontWeight: '800', color: themeStyles.textPrimary }}>Welcome back!</h3>
        <p style={{ color: themeStyles.textSecondary, fontSize: '14px', margin: 0 }}>Signed in with {userRole} privileges.</p>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: themeStyles.cardBg,
          padding: '8px 14px',
          borderRadius: '20px',
          border: `1px solid ${themeStyles.cardBorder}`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          fontSize: '12px',
          fontWeight: '600',
          color: themeStyles.textPrimary
        }}
      >
        <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981' }} />
        <span>Backend API: Online</span>
        <span style={{ color: '#94a3b8' }}>•</span>
        <span style={{ color: '#059669' }}>Cluster: 24ms</span>
      </div>
    </header>

    {lowStockItems.length > 0 && (
      <div className="alert-banner">
        <div>
          <div style={{ color: '#991b1b', fontWeight: '700', fontSize: '15px' }}>⚠️ System Alerts Detected!</div>
          <div style={{ color: '#b91c1c', fontSize: '13px', marginTop: '4px' }}>
            {lowStockItems.length} items low on stock | {defectiveLogs.length} items flagged with defect records.
          </div>
        </div>
        <button type="button" className="alert-btn" onClick={() => setActiveTab('alerts')}>View Alert Center</button>
      </div>
    )}

    <section className="stats-grid" style={{ marginBottom: '28px' }}>
      <div className="stat-card-white" style={{ backgroundColor: themeStyles.statCardBg, borderColor: themeStyles.cardBorder, borderLeft: '5px solid #3b82f6' }}>
        <div className="stat-title" style={{ color: themeStyles.textSecondary }}>Total Stock Items</div>
        <div className="stat-value" style={{ color: themeStyles.textPrimary }}>{inventoryList.length}</div>
      </div>
      <div className="stat-card-white" style={{ backgroundColor: themeStyles.statCardBg, borderColor: themeStyles.cardBorder, borderLeft: '5px solid #8b5cf6' }}>
        <div className="stat-title" style={{ color: themeStyles.textSecondary }}>Active Suppliers</div>
        <div className="stat-value" style={{ color: themeStyles.textPrimary }}>{suppliersList.length}</div>
      </div>
      <div className="stat-card-white" style={{ backgroundColor: themeStyles.statCardBg, borderColor: themeStyles.cardBorder, borderLeft: '5px solid #10b981' }}>
        <div className="stat-title" style={{ color: themeStyles.textSecondary }}>Total Asset Value</div>
        <div className="stat-value" style={{ color: themeStyles.textPrimary }}>₱{totalInventoryAssetValue.toLocaleString()}.00</div>
      </div>
      <div className="stat-card-white" style={{ backgroundColor: themeStyles.statCardBg, borderColor: themeStyles.cardBorder, borderLeft: '5px solid #ef4444' }}>
        <div className="stat-title" style={{ color: themeStyles.textSecondary }}>Low Stock Alerts</div>
        <div className="stat-value" style={{ color: themeStyles.textPrimary }}>{lowStockItems.length}</div>
      </div>
    </section>

    <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '12px', padding: '24px', border: `1px solid ${themeStyles.cardBorder}`, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
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
              <div style={{ width: '100%', height: '9px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, height: '100%', backgroundColor: barColors[idx % barColors.length], borderRadius: '6px', transition: 'width 0.5s ease' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// ================= TAB 2: INVENTORY CATALOG =================
export const InventoryTab = ({
  themeStyles,
  setIsScannerOpen,
  handleExportCSV,
  itemForm,
  setItemForm,
  handleAddStockItem,
  suppliersList,
  inventorySearch,
  setInventorySearch,
  inventoryCategoryFilter,
  setInventoryCategoryFilter,
  filteredCatalog,
  getItemName,
  getSupplierName,
  getBinLocation,
  setSelectedQrItem,
  setIsQrModalOpen,
  handleUpdateStockQty,
  handleOpenDefect,
  handleDeleteItem
}) => (
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

    <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '22px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '32px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>Add Furniture Item with Storage Bin</h3>
      <form onSubmit={handleAddStockItem}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '14px' }}>
          <input type="text" placeholder="Item Name *" className="form-input" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
          <select className="form-input" value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}>
            <option value="Chairs & Seating">Chairs & Seating</option>
            <option value="Tables & Desks">Tables & Desks</option>
            <option value="Storage & Shelving">Storage & Shelving</option>
            <option value="Beds & Mattresses">Beds & Mattresses</option>
          </select>
          <input type="number" placeholder="Quantity Stock *" className="form-input" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })} required />
          <input type="number" placeholder="Unit Price (₱) *" className="form-input" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '18px' }}>
          <select className="form-input" value={itemForm.supplier} onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })}>
            <option value="">-- Select Supplier * --</option>
            {suppliersList.map((sup) => (<option key={sup.id || sup._id} value={sup.name}>{sup.name}</option>))}
          </select>
          <select className="form-input" value={itemForm.aisle} onChange={(e) => setItemForm({ ...itemForm, aisle: e.target.value })}>
            <option value="Aisle A">Aisle A</option>
            <option value="Aisle B">Aisle B</option>
            <option value="Aisle C">Aisle C</option>
            <option value="Aisle D">Aisle D</option>
          </select>
          <select className="form-input" value={itemForm.rack} onChange={(e) => setItemForm({ ...itemForm, rack: e.target.value })}>
            <option value="Rack 1">Rack 1</option>
            <option value="Rack 2">Rack 2</option>
            <option value="Rack 3">Rack 3</option>
            <option value="Rack 4">Rack 4</option>
          </select>
        </div>

        <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '7px', fontWeight: '700', cursor: 'pointer' }}>
          Add Stock Item
        </button>
      </form>
    </div>

    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: themeStyles.textPrimary }}>Current Stock Catalog</h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="text" placeholder="Search item..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${themeStyles.cardBorder}`, fontSize: '13px', outline: 'none' }} />
          <select value={inventoryCategoryFilter} onChange={(e) => setInventoryCategoryFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${themeStyles.cardBorder}`, fontSize: '13px', backgroundColor: themeStyles.cardBg, color: themeStyles.textPrimary }}>
            <option value="All Categories">All Categories</option>
            <option value="Chairs & Seating">Chairs & Seating</option>
            <option value="Tables & Desks">Tables & Desks</option>
            <option value="Storage & Shelving">Storage & Shelving</option>
            <option value="Beds & Mattresses">Beds & Mattresses</option>
          </select>
        </div>
      </div>

      <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: themeStyles.tableHeaderBg, borderBottom: `1px solid ${themeStyles.cardBorder}`, color: themeStyles.textSecondary }}>
              <th style={{ padding: '14px 18px', fontWeight: '700' }}>Item Name</th>
              <th style={{ padding: '14px 18px', fontWeight: '700' }}>Category</th>
              <th style={{ padding: '14px 18px', fontWeight: '700' }}>Bin Location</th>
              <th style={{ padding: '14px 18px', fontWeight: '700' }}>Stock Qty</th>
              <th style={{ padding: '14px 18px', fontWeight: '700' }}>Defects</th>
              <th style={{ padding: '14px 18px', fontWeight: '700' }}>Unit Price</th>
              <th style={{ padding: '14px 18px', fontWeight: '700' }}>Supplier</th>
              <th style={{ padding: '14px 18px', fontWeight: '700', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCatalog.map((item, idx) => {
              const isLow = (Number(item.quantity) || 0) <= (Number(item.minThreshold) || 5);
              const displayName = getItemName(item);
              return (
                <tr key={item._id || idx} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
                  <td style={{ padding: '14px 18px', fontWeight: '700', color: themeStyles.textPrimary }}>{displayName}</td>
                  <td style={{ padding: '14px 18px', color: themeStyles.textSecondary }}>{String(item.category || 'General')}</td>
                  <td style={{ padding: '14px 18px', color: themeStyles.textPrimary, fontWeight: '600' }}>{getBinLocation(item)}</td>
                  <td style={{ padding: '14px 18px', fontWeight: '800', color: isLow ? '#ef4444' : themeStyles.textPrimary }}>
                    {item.quantity} {isLow && <span style={{ fontSize: '12px', fontWeight: '600' }}>(Low)</span>}
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
);

// ================= TAB 3: 2D WAREHOUSE FLOOR MAP =================
export const WarehouseMapTab = ({
  themeStyles,
  occupiedSlotsCount,
  TOTAL_WAREHOUSE_SLOTS,
  warehouseOccupancyPct,
  isDarkMode,
  putawayCategory,
  setPutawayCategory,
  handleRecommendBin,
  recommendedBin
}) => (
  <div>
    <header className="dashboard-header" style={{ marginBottom: '24px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>Digital 2D Warehouse Floor Map & Putaway</h1>
    </header>

    <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '18px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: themeStyles.textPrimary }}>📦 Total Warehouse Storage Slot Utilization</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>{occupiedSlotsCount} / {TOTAL_WAREHOUSE_SLOTS} Bins Occupied ({warehouseOccupancyPct}% Capacity)</span>
      </div>
      <div style={{ width: '100%', height: '9px', backgroundColor: isDarkMode ? '#0f172a' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ width: `${warehouseOccupancyPct}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '5px', transition: 'width 0.4s ease' }} />
      </div>
    </div>

    <div style={{ backgroundColor: themeStyles.cardBg, borderLeft: '5px solid #4f46e5', border: `1px solid ${themeStyles.cardBorder}`, borderRadius: '10px', padding: '20px 24px', marginBottom: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>
        <span>🎯</span> Directed Putaway Recommendation Engine
      </div>
      <p style={{ margin: '6px 0 14px 0', fontSize: '13px', color: themeStyles.textSecondary }}>
        Select an incoming product category to query MongoDB for the optimal, nearest empty storage bin:
      </p>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <select value={putawayCategory} onChange={(e) => setPutawayCategory(e.target.value)} style={{ padding: '9px 14px', borderRadius: '7px', border: `1px solid ${themeStyles.cardBorder}`, fontSize: '13px', backgroundColor: themeStyles.cardBg, color: themeStyles.textPrimary, minWidth: '240px' }}>
          <option value="Chairs & Seating (Zone A)">Chairs & Seating (Zone A)</option>
          <option value="Tables & Desks (Zone B)">Tables & Desks (Zone B)</option>
          <option value="Storage & Shelving (Zone C)">Storage & Shelving (Zone C)</option>
          <option value="Beds & Mattresses (Zone D)">Beds & Mattresses (Zone D)</option>
        </select>
        <button type="button" onClick={handleRecommendBin} style={{ backgroundColor: '#4f46e5', color: '#ffffff', border: 'none', padding: '9px 18px', borderRadius: '7px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
          Recommend Storage Bin
        </button>
        {recommendedBin && <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a', marginLeft: '8px' }}>Recommended Target: Bin {recommendedBin}</span>}
      </div>
    </div>

    <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '24px', border: `1px solid ${themeStyles.cardBorder}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: themeStyles.textPrimary }}>Warehouse 2D Storage Rack Layout</h3>
        <div style={{ display: 'flex', gap: '18px', fontSize: '12px', color: themeStyles.textSecondary }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }}></div> Occupied Bin</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px' }}></div> Empty Bin</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', backgroundColor: '#fbbf24', borderRadius: '2px' }}></div> Recommended Putaway Target</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {[
          { code: 'A', title: 'Aisle A (Chairs)' },
          { code: 'B', title: 'Aisle B (Tables)' },
          { code: 'C', title: 'Aisle C (Storage)' },
          { code: 'D', title: 'Aisle D (Beds)' }
        ].map((aisle) => (
          <div key={aisle.code} style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc', padding: '16px', borderRadius: '8px', border: `1px solid ${themeStyles.cardBorder}` }}>
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
);

// ================= TAB 4: SUPPLIER MANAGEMENT =================
export const SuppliersTab = ({
  themeStyles,
  supplierForm,
  setSupplierForm,
  handleSaveSupplier,
  suppliersList,
  handleDeleteSupplier
}) => (
  <div>
    <header className="dashboard-header" style={{ marginBottom: '24px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>Supplier & Vendor Database</h1>
    </header>

    <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '22px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '32px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>Add New Supplier</h3>
      <form onSubmit={handleSaveSupplier}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
          <input type="text" placeholder="Company Name *" className="form-input" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} required />
          <input type="text" placeholder="Contact Person *" className="form-input" value={supplierForm.contactPerson} onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })} required />
          <input type="email" placeholder="Email Address *" className="form-input" value={supplierForm.email} onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
          <input type="tel" placeholder="Contact Number *" className="form-input" value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} required />
          <input type="text" placeholder="Business Address *" className="form-input" value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} required />
        </div>
        <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '7px', fontWeight: '700', cursor: 'pointer' }}>
          Save Supplier
        </button>
      </form>
    </div>

    <div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: themeStyles.textPrimary }}>Active Suppliers</h3>
      <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto' }}>
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
);

// ================= TAB 5: PURCHASE ORDERS =================
export const OrdersTab = ({
  themeStyles,
  totalCommittedPO,
  MONTHLY_BUDGET,
  budgetPercentage,
  isDarkMode,
  poForm,
  setPoForm,
  handlePoItemSelect,
  inventoryList,
  getItemName,
  handleSubmitPurchaseOrder,
  ordersList,
  handleApprovePo,
  handleCancelPo,
  handleOpenPrintSlip
}) => (
  <div>
    <header className="dashboard-header" style={{ marginBottom: '20px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>Purchase Orders & Restocking</h1>
    </header>

    <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '18px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '26px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', color: themeStyles.textPrimary }}>📊 Monthly Restocking Budget Utilization</span>
        <span style={{ fontSize: '13px', fontWeight: '700', color: budgetPercentage > 85 ? '#dc2626' : '#2563eb' }}>
          ₱{totalCommittedPO.toLocaleString()}.00 / ₱{MONTHLY_BUDGET.toLocaleString()}.00 ({budgetPercentage}%)
        </span>
      </div>
      <div style={{ width: '100%', height: '10px', backgroundColor: isDarkMode ? '#0f172a' : '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ width: `${budgetPercentage}%`, height: '100%', backgroundColor: budgetPercentage > 85 ? '#ef4444' : budgetPercentage > 60 ? '#f59e0b' : '#10b981', borderRadius: '5px', transition: 'width 0.4s ease' }} />
      </div>
    </div>

    <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', padding: '22px 24px', border: `1px solid ${themeStyles.cardBorder}`, marginBottom: '32px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>Create Purchase Order (Reorder)</h3>
      <form onSubmit={handleSubmitPurchaseOrder}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
          <select className="form-input" value={poForm.selectedItemName} onChange={(e) => handlePoItemSelect(e.target.value)} required>
            <option value="">-- Select Item to Restock * --</option>
            {inventoryList.map((item, idx) => (
              <option key={item._id || idx} value={getItemName(item)}>{getItemName(item)} (Current: {item.quantity})</option>
            ))}
          </select>
          <input type="text" className="form-input" value={poForm.assignedSupplier ? `-- Assigned Supplier: ${poForm.assignedSupplier} --` : '-- Assigned Supplier --'} disabled style={{ backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9', cursor: 'not-allowed' }} />
          <input type="number" placeholder="Order Quantity *" className="form-input" value={poForm.quantity} onChange={(e) => setPoForm({ ...poForm, quantity: e.target.value })} required />
        </div>
        <div style={{ marginBottom: '16px', fontSize: '15px', fontWeight: '700', color: themeStyles.textPrimary }}>
          Total: ₱{((Number(poForm.quantity) || 0) * (Number(poForm.unitPrice) || 0)).toFixed(2)}
        </div>
        <button type="submit" style={{ backgroundColor: '#10b981', color: '#ffffff', border: 'none', padding: '10px 22px', borderRadius: '7px', fontWeight: '700', cursor: 'pointer' }}>
          Submit Purchase Order
        </button>
      </form>
    </div>

    <div>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: '800', color: themeStyles.textPrimary }}>Purchase Order History</h3>
      <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto' }}>
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
                  <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', backgroundColor: po.status === 'Approved' ? '#dcfce7' : po.status === 'Cancelled' ? '#fee2e2' : '#fef3c7', color: po.status === 'Approved' ? '#15803d' : po.status === 'Cancelled' ? '#b91c1c' : '#b45309' }}>
                    {po.status}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: '6px' }}>
                    {po.status === 'Pending' && (
                      <>
                        <button type="button" onClick={() => handleApprovePo(po.id)} style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Approve</button>
                        <button type="button" onClick={() => handleCancelPo(po.id)} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                      </>
                    )}
                    <button type="button" onClick={() => handleOpenPrintSlip(po)} style={{ backgroundColor: '#475569', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Print Slip</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ================= TAB 6: ALERTS CENTER =================
export const AlertsTab = ({
  themeStyles,
  handleAutoGeneratePO,
  lowStockItems,
  getItemName,
  getSupplierName,
  defectiveLogs
}) => (
  <div>
    <header className="dashboard-header" style={{ marginBottom: '24px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', color: themeStyles.textPrimary, margin: 0 }}>Automated Warning & Alert Center</h1>
    </header>

    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: themeStyles.cardBg, borderLeft: '5px solid #f97316', border: `1px solid ${themeStyles.cardBorder}`, borderRadius: '10px', padding: '20px 24px', marginBottom: '32px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: '800', color: themeStyles.textPrimary }}>
          <span>⚡</span> Automated Purchase Order Generator
        </div>
        <div style={{ fontSize: '13px', color: themeStyles.textSecondary, marginTop: '6px' }}>
          Click below to automatically create pending Purchase Orders for all items currently below their reorder thresholds.
        </div>
      </div>
      <button type="button" onClick={handleAutoGeneratePO} style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
        Auto-Generate Restock POs
      </button>
    </div>

    <div style={{ marginBottom: '36px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <span style={{ fontSize: '16px' }}>📉</span>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#b91c1c' }}>Low Stock Warning Flags ({lowStockItems.length})</h3>
      </div>

      <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto' }}>
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
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontStyle: 'italic', color: '#b91c1c', fontWeight: '600' }}>Reorder Needed</span>
                  </td>
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
        <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto' }}>
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
                    {log.photo ? (
                      <img src={log.photo} alt="Damage Proof" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    ) : (
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>No Photo</span>
                    )}
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
);

// ================= TAB 7: AUDIT LOGS =================
export const AuditLogsTab = ({
  themeStyles,
  setIsAuditPrintModalOpen,
  auditLogs,
  formatLogDate
}) => (
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

    <div style={{ backgroundColor: themeStyles.cardBg, borderRadius: '10px', border: `1px solid ${themeStyles.cardBorder}`, overflowX: 'auto' }}>
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
          {auditLogs.map((log, idx) => (
            <tr key={log.id || idx} style={{ borderBottom: `1px solid ${themeStyles.tableBorder}` }}>
              <td style={{ padding: '14px 20px', color: themeStyles.textSecondary, whiteSpace: 'nowrap' }}>
                {formatLogDate(log.timestamp || log.createdAt)}
              </td>
              <td style={{ padding: '14px 20px', fontWeight: '700', color: themeStyles.textPrimary }}>{log.action}</td>
              <td style={{ padding: '14px 20px', color: themeStyles.textSecondary }}>{log.role}</td>
              <td style={{ padding: '14px 20px', color: themeStyles.textPrimary }}>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);