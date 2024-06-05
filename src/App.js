import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import './App.css';

function App() {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [editingImage, setEditingImage] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://a5y552qdoxkhls6uzwt45aqy7q0rtguo.lambda-url.us-east-1.on.aws/");
      const data = await response.json();
      setItems(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch items:', error);
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (newItem.trim() !== '') {
      setLoading(true);
      try {
        const imageData = newImage ? await convertToBase64(newImage) : { base64: null, mimeType: null };
        const response = await fetch("https://oubnbeu2n2ngkqdytdurtgjobi0bukap.lambda-url.us-east-1.on.aws/", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: newItem,
            image: imageData.base64,
            image_mime: imageData.mimeType
          })
        });
        const data = await response.json();
        setItems([...items, data]);
        setNewItem('');
        setNewImage(null);
        setMessage('Item added successfully!');
        setLoading(false);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Failed to add item:', error);
        setMessage('Failed to add item.');
        setLoading(false);
      }
    }
  };

  const handleDeleteItem = async (id) => {
    setLoading(true);
    try {
      await fetch(`https://kzfmjj6a66lpkg625wugk7m7o40wptew.lambda-url.us-east-1.on.aws/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      setItems(items.filter(item => item.id !== id));
      setMessage('Item deleted successfully!');
      setLoading(false);
    } catch (error) {
      console.error('Failed to delete item:', error);
      setMessage('Failed to delete item.');
      setLoading(false);
    }
  };

  const handleEditItem = async (id) => {
    setLoading(true);
    try {
      const imageData = editingImage ? await convertToBase64(editingImage) : { base64: null, mimeType: null };
      const response = await fetch("https://klynvkvtxgm2m6ghogovkckxae0uncyo.lambda-url.us-east-1.on.aws/", {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          text: editingText,
          image: imageData.base64,
          image_mime: imageData.mimeType
        })
      });
      const data = await response.json();
      setItems(items.map(item => (item.id === id ? data : item)));
      setEditingItem(null);
      setEditingText('');
      setEditingImage(null);
      setMessage('Item updated successfully!');
      setLoading(false);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to edit item:', error);
      setMessage('Failed to edit item.');
      setLoading(false);
    }
  };

  const startEditing = (id, currentText, currentImage) => {
    setEditingItem(id);
    setEditingText(currentText);
    setEditingImage(currentImage);
    setIsEditModalOpen(true);
  };

  const viewItemDetails = (item) => {
    setViewItem(item);
    setIsViewModalOpen(true);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result;
        const base64 = result.split(',')[1];
        const mimeType = result.split(';')[0].split(':')[1];
        resolve({ base64, mimeType });
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="App">
      <h1>Recipe Management</h1>
      <button className="add-btn" onClick={() => setIsModalOpen(true)}>Add Recipe</button>
      {message && (
        <div className={message.includes('successfully') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}
      {loading && <div className="loading">Loading...</div>}
      <ul className="todo-list">
        {items.map(item => (
          <li key={item.id} onClick={() => viewItemDetails(item)}>
            {item.image_url && <img src={item.image_url} alt={item.text} className="item-image" />}
            <span>{item.text}</span>
            <div className='list-btns'>
            <button className="delete" onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }}>Delete</button>
            <button className="edit" onClick={(e) => { e.stopPropagation(); startEditing(item.id, item.text, item.image_url); }}>Edit</button>
            </div>
          </li>
        ))}
      </ul>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Add Item Modal"
        className="modal"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <h2>Add Item</h2>
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder="Recipe Title"
          className="modal-input"
        />
        <input
          type="file"
          onChange={(e) => setNewImage(e.target.files[0])}
          className="modal-input"
        />
        <div className="modal-buttons">
          <button className="modal-btn" onClick={handleAddItem}>Add</button>
          <button className="modal-btn cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
      <Modal
        isOpen={isEditModalOpen}
        onRequestClose={() => setIsEditModalOpen(false)}
        contentLabel="Edit Item Modal"
        className="modal"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        <h2>Edit Item</h2>
        <input
          type="text"
          value={editingText}
          onChange={(e) => setEditingText(e.target.value)}
          className="modal-input"
        />
        <input
          type="file"
          onChange={(e) => setEditingImage(e.target.files[0])}
          className="modal-input"
        />
        <div className="modal-buttons">
          <button className="modal-btn" onClick={() => handleEditItem(editingItem)}>Save</button>
          <button className="modal-btn cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
      <Modal
        isOpen={isViewModalOpen}
        onRequestClose={() => setIsViewModalOpen(false)}
        contentLabel="View Item Modal"
        className="modal"
        overlayClassName="overlay"
        ariaHideApp={false}
      >
        {viewItem && (
          <>
            <h2>{viewItem.text}</h2>
            {viewItem.image_url && <img src={viewItem.image_url} alt={viewItem.text} className="view-image" />}
            <button className="modal-btn cancel" onClick={() => setIsViewModalOpen(false)}>Close</button>
          </>
        )}
      </Modal>
    </div>
  );
}

export default App;
