```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { dataText } from '../lib/store';
  import Bar from './Bar.svelte';
  import ContentEditable from './ContentEditable.svelte';
  import { scale, slide } from 'svelte/transition';
  let modalOpen = false;
  let editingText = null;
  let grid = null;

  function initializeGrid() {
    const initialize = () => {
      const container = document.querySelector('#main-container');
      if (!container) {
        console.error('Container #main-container not found, retrying...');
        setTimeout(initialize, 100);
        return;
      }
      if (!window.GridStack) {
        console.error('GridStack library not loaded');
        return;
      }
      try {
        grid = window.GridStack.init({
          float: true,
          cellHeight: 50,
          column: 12,
          resizable: {
            handles: 'se',
            autoHide: false
          },
          margin: 10,
          alwaysShowResizeHandle: true,
          acceptWidgets: true,
          animate: true
        }, '#main-container');

        grid.on('change', (event, items) => {
          if (!items) return;
          console.log('Grid changed, updating positions:', items);
          const updatedPositions = items.map(item => ({
            id: item.id.replace('object-', ''),
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          }));
          dataText.update(current => {
            const newCurrent = current.map(text => {
              const updated = updatedPositions.find(up => up.id === text.id);
              if (updated) {
                return { ...text, x: updated.x, y: updated.y, w: updated.w, h: updated.h };
              }
              return text;
            });
            console.log('Updated dataText:', newCurrent);
            return newCurrent;
          });
        });
        console.log('GridStack initialized successfully');
        console.log('Initial grid-stack-items:', document.querySelectorAll('.grid-stack-item').length);
      } catch (error) {
        console.error('Failed to initialize GridStack:', error);
      }
    };

    initialize();
  }

  onMount(() => {
    initializeGrid();
    return () => {
      if (grid) {
        try {
          console.log('Destroying GridStack');
          grid.destroy(true);
        } catch (error) {
          console.error('Error destroying GridStack:', error);
        }
      }
    };
  });

  export function openAddModal() {
    editingText = { id: null, title: '', widgets: [], x: 0, y: 0, w: 6, h: 8 };
    modalOpen = true;
  }

  function openEditModal(text) {
    editingText = { ...text, widgets: text.widgets || [] };
    modalOpen = true;
  }

  function cancelModal() {
    modalOpen = false;
    editingText = null;
  }

  function deleteText(id) {
    if (confirm('Bạn có chắc chắn muốn xóa object này?')) {
      console.log('Attempting to delete widget with id:', `object-${id}`);
      const el = document.querySelector(`#object-${id}`);
      if (!el) {
        console.warn(`Element #object-${id} not found in DOM`);
      } else if (!grid) {
        console.warn('GridStack instance not initialized');
      } else {
        try {
          grid.removeWidget(el, false);
          console.log('Widget removed successfully from GridStack');
        } catch (error) {
          console.error('Error removing widget:', error);
        }
      }
      dataText.update(current => {
        const newCurrent = current.filter(text => text.id !== id);
        console.log('Updated dataText:', newCurrent);
        return newCurrent;
      });
      setTimeout(() => {
        console.log('Remaining grid-stack-items in DOM:', document.querySelectorAll('.grid-stack-item').length);
      }, 0);
    }
  }

  function deleteContent(id, contentIndex) {
    if (confirm('Bạn có chắc chắn muốn xóa nội dung này?')) {
      dataText.update((current) => {
        const index = current.findIndex((text) => text.id === id);
        if (index !== -1) {
          const updatedText = {
            ...current[index],
            widgets: current[index].widgets.filter((_, i) => i !== contentIndex),
          };
          return current.map((text, i) => (i === index ? updatedText : text));
        }
        return current;
      });
    }
  }

  function deleteContentInModal(contentIndex) {
    editingText.widgets = editingText.widgets.filter((_, i) => i !== contentIndex);
  }

  function saveText(updatedText) {
    if (updatedText.id) {
      dataText.update(current => current.map(text => text.id === updatedText.id ? updatedText : text));
      if (grid) {
        try {
          grid.update(document.querySelector(`#object-${updatedText.id}`), {
            x: updatedText.x,
            y: updatedText.y,
            w: updatedText.w,
            h: updatedText.h,
          });
          console.log('Widget updated in GridStack:', updatedText.id);
        } catch (error) {
          console.error('Error updating widget:', error);
        }
      }
    } else {
      const newId = `${Date.now()}`;
      updatedText = { ...updatedText, id: newId };
      dataText.update(current => [...current, updatedText]);
      setTimeout(() => {
        const el = document.querySelector(`#object-${newId}`);
        if (el && grid) {
          grid.makeWidget(el);
          console.log('New widget attached to GridStack:', newId);
        } else {
          console.error('Failed to attach new widget:', { el, grid });
        }
      }, 0);
    }
    modalOpen = false;
  }

  function updateTitle(id, newTitle) {
    dataText.update((current) => {
      const index = current.findIndex((text) => text.id === id);
      if (index !== -1) {
        const updatedText = { ...current[index], title: newTitle };
        return current.map((text, i) => (i === index ? updatedText : text));
      }
      return current;
    });
  }

  function updateContentItem(id, contentIndex, newContent) {
    dataText.update((current) => {
      const index = current.findIndex((text) => text.id === id);
      if (index !== -1) {
        const updatedWidgets = [...current[index].widgets];
        updatedWidgets[contentIndex] = {
          ...updatedWidgets[contentIndex],
          content: newContent
        };
        const updatedText = { ...current[index], widgets: updatedWidgets };
        return current.map((text, i) => (i === index ? updatedText : text));
      }
      return current;
    });
  }

  function handleContentChange({ detail }, id, type, index = null) {
    if (type === 'title') {
      updateTitle(id, detail);
    } else if (type === 'content') {
      updateContentItem(id, index, detail);
    } else if (type === 'modalTitle') {
      editingText.title = detail;
    } else if (type === 'modalContent') {
      editingText.widgets[index] = { ...editingText.widgets[index], content: detail };
    }
  }

  function handleOpenAddModal() {
    openAddModal();
  }
</script>

<main>
  <Bar on:openAddModal={handleOpenAddModal} />
  <div id="main-container" class="grid-stack">
    {#each $dataText as text (text.id)}
      <div 
        class="object-container grid-stack-item"
        id="object-{text.id}"
        gs-id="object-{text.id}"
        gs-x={text.x || 0}
        gs-y={text.y || 0}
        gs-w={text.w || 12}
        gs-h={text.h || 4}
      >
        <div class="notetool">
          <button on:click={() => deleteText(text.id)}>
            <span class="material-symbols-outlined">delete</span>
          </button>
          <button on:click={() => openEditModal(text)}>
            <span class="material-symbols-outlined">add_notes</span>
          </button>
        </div>
        <div class="grid-stack-item-content"> 
          <ContentEditable
            id="title-{text.id}"
            content={text.title}
            on:contentChange={(e) => handleContentChange(e, text.id, 'title')}
          />
          <div class="content-container">
            {#each text.widgets as widget, i (widget.id)}
              <div class="content-item">
                <ContentEditable
                  id="content-{text.id}-{i}"
                  content={widget.content}
                  on:contentChange={(e) => handleContentChange(e, text.id, 'content', i)}
                />
              </div>
            {/each}
          </div>
        </div>
      </div>
    {/each}
  </div>

  {#if modalOpen}
    <div class="modal" in:slide={{ duration: 500 }} out:slide={{ duration: 100 }}>
      <div id="toolmodal">
        <h2>{editingText.id ? 'Chỉnh sửa' : 'Thêm mới'}</h2>
        <div id="containdirectmodal">
          <button on:click={() => saveText(editingText)}>
            <span class="material-symbols-outlined">check</span>
          </button>
          <button on:click={cancelModal}>
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
      <h3>Tiêu đề:</h3>
      <ContentEditable
        id="modal-title"
        content={editingText.title}
        on:contentChange={(e) => handleContentChange(e, null, 'modalTitle')}
      />
      <div style="max-height: 46vh;">
        <h3>Nội dung:</h3>
        {#each editingText.widgets as widget, i (i)}
          <div class="content-item">
            <ContentEditable
              id="modal-content-{i}"
              content={widget.content}
              on:contentChange={(e) => handleContentChange(e, null, 'modalContent', i)}
            />
            <button class="remove" on:click={() => deleteContentInModal(i)}>
              <span class="material-symbols-outlined">remove_selection</span>
            </button>
          </div>
        {/each}
      </div>
    </div>
    <button
      id="addinf"
      on:click={() => (editingText.widgets = [...editingText.widgets, { id: `content-${Date.now()}`, content: '' }])}
    >
      <span class="material-symbols-outlined">add_2</span>
    </button>
  {/if}
</main>

<style>
   main {
      background-color: #3c3c3c;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.11'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3Cpath d='M6 5V0H5v5H0v1h5v94h1V6h94V5H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      position: absolute;
      top: 0px;
      right: 0px;
      left: 0px;
      min-height: 100%;
    }
  .notetool {
    padding: 0;
    border-radius: .5rem;
    border: 0;
    position: absolute;
    left: 0;
    top: 1rem;
    height: 4rem;
    width: .3rem;
    background-color: #c2c2c2;
  }
  .notetool:hover {
    width: 2rem;
    left: -2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    max-height: fit-content;
    padding-block: 0.2rem;
    box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
    transition: 0.2s ease;
    background-color: #fefefe;
    border-right: 4px solid #43646d;
    border-radius: 0;
  }
  .notetool:hover button:nth-of-type(1) {
    color: #c4c4c4;
    display: block;
  }
  .notetool:hover button:nth-of-type(2) {
    color: #c4c4c4;
    display: block;
  }
  .notetool button {
    display: none;
    cursor: pointer;
    background: none;
    border: 0;
  }
  .notetool:hover button:nth-of-type(1):hover

 {
    color: red;
  }
  .notetool:hover button:nth-of-type(2):hover {
    color: green;
  }
  .remove {
    cursor: pointer;
    background-color: transparent;
    border: none;
  }
  .remove span {
    color: #c4c4c4;
  }
  .remove span:hover {
    scale: 1.05;
    color: #43646d;
  }
  .remove span:active {
    scale: 0.95;
  }
  #addinf {
    cursor: pointer;
    background-color: #43646d;
    color: #ebe8df;
    border-radius: 100%;
    aspect-ratio: 1;
    border: 0;
    position: fixed;
    left: 96%;
    bottom: 1%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
  }
  #addinf:hover {
    scale: 1.05;
  }
  #addinf:active {
    scale: 0.95;
  }
  #addinf span {
    font-size: 2rem;
  }
  h2 {
    margin: 0;
  }
  #toolmodal {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e9e9e9;
  }
  #containdirectmodal button:nth-of-type(1):hover {
    color: green;
  }
  #containdirectmodal button:nth-of-type(2):hover {
    color: red;
  }
  #containdirectmodal button {
    font-size: 1rem;
    border: 0;
    background: none;
    color: #262626;
    cursor: pointer;
  }
  .object-container {
    padding: 0;
    margin: 0;
    background-color:rgb(255 255 255 / 0%);
    border-radius: 1rem;
    box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
    transition: 0.5s ease;
  }
  .object-container:hover {
    box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
    background-color: rgb(255 255 255 / 20%);
  }
  .content-container {
    margin-top: 10px;
  
  }
  .content-item {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
  }
  .modal {
    position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      padding: 20px;
      border: 1px solid #00000042;
      z-index: 1000;
      min-width: 35vw;
      max-width: 90vw;
      max-height: 78vh;
      overflow: auto;
      border-radius: 2rem;
      box-shadow: #0e1e251f 0 2px 4px, #0e1e2552 0 2px 16px;
      display: flex;
      flex-direction: column;
  }
  :global(.grid-stack-item) {
    
  }
  :global(.grid-stack-item-content) {
    background: transparent;
    padding: 0;
    cursor:move;
  }
  :global(.ui-resizable-handle) {
    pointer-events: auto;
    cursor: se-resize;
    opacity: 0.2;
  }
  :global(.ui-resizable-handle:hover){
    opacity: 1;
  }
</style>
