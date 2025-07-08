<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';
    import { scale } from 'svelte/transition';
  
    const dispatch = createEventDispatcher();
    let isExpanded = false;
  
    function execCmd(cmd, value = null) {
      if (browser) {
        try {
          document.execCommand(cmd, false, value);
          dispatch('formatApplied', { cmd, value });
        } catch (err) {
          console.error(`Failed to execute command ${cmd}:`, err);
        }
      }
    }
  
    function changeFontSize() {
      const size = document.getElementById('size').value;
      execCmd('fontSize', size);
    }
  
    function changeFontColor() {
      const color = document.getElementById('fontColor').value;
      execCmd('foreColor', color);
    }
  
    function updateFontColor() {
      const color = document.getElementById('fontColor').value;
      document.getElementById('containFontColor').style.backgroundColor = color;
    }
  
    function changeBackColor() {
      const color = document.getElementById('backColor').value;
      execCmd('hiliteColor', color);
    }
  
    function updateBackColor() {
      const color = document.getElementById('backColor').value;
      document.getElementById('containBackColor').style.backgroundColor = color;
    }
  
    function handleAddClick() {
      dispatch('openAddModal');
    }
  
    onMount(() => {
      // No additional setup needed
    });
  </script>
  
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="container"
    class:expanded={isExpanded}
    on:mouseenter={() => isExpanded = true}
    on:mouseleave={() => isExpanded = false}
    transition:scale={{ duration: 1000 }}
  >
    <div class="group group1" class:hidden={!isExpanded}>
      <select id="font" on:change={() => execCmd('fontName', document.getElementById('font').value)}>
        <option value="Arial" style="font-family: Arial;">Arial</option>
        <option value="'Times New Roman'" style="font-family: 'Times New Roman';">Times New Roman</option>
        <option value="Verdana" style="font-family: Verdana;">Verdana</option>
        <option value="Georgia" style="font-family: Georgia;">Georgia</option>
        <option value="Courier New" style="font-family: 'Courier New';">Courier New</option>
        <option value="cursive" style="font-family: cursive;">Cursive</option>
        <option value="fantasy" style="font-family: fantasy;">Fantasy</option>
        <option value="serif" style="font-family: serif;">Serif</option>
        <option value="monospace" style="font-family: monospace;">Monospace</option>
        <option value="Palatino" style="font-family: Palatino;">Palatino</option>
        <option value="Comic Sans MS" style="font-family: 'Comic Sans MS';">Comic Sans MS</option>
        <option value="Impact" style="font-family: Impact;">Impact</option>
        <option value="Lucida Console" style="font-family: 'Lucida Console';">Lucida Console</option>
      </select>
      <select id="size" on:change={changeFontSize}>
        <option value="1" style="font-size: 8px;">8</option>
        <option value="2" style="font-size: 10px;">10</option>
        <option value="3" style="font-size: 12px;">12</option>
        <option value="4" style="font-size: 14px;">14</option>
        <option value="5" style="font-size: 18px;">18</option>
        <option value="6" style="font-size: 24px;">24</option>
        <option value="7" style="font-size: 36px;">36</option>
        <option value="7" style="font-size: 48px;">48</option>
        <option value="7" style="font-size: 60px;">60</option>
        <option value="7" style="font-size: 72px;">72</option>
      </select>
      
    </div>
  
    <div class="group group2" class:hidden={!isExpanded}>
      <button on:click={() => execCmd('bold')} title="In đậm">
        <span class="material-symbols-outlined">format_bold</span>
      </button>
      <button on:click={() => execCmd('italic')} title="In nghiêng">
        <span class="material-symbols-outlined">format_italic</span>
      </button>
      <button on:click={() => execCmd('underline')} title="Gạch chân">
        <span class="material-symbols-outlined">format_underlined</span>
      </button>
      <button on:click={changeFontColor} title="Màu chữ">
        <span class="material-symbols-outlined">format_color_text</span>
      </button>
      <div id="containFontColor">
        <input type="color" id="fontColor" on:change={updateFontColor} />
      </div>
      <button on:click={changeBackColor} title="Màu nền">
        <span class="material-symbols-outlined">format_color_fill</span>
      </button>
      <div id="containBackColor">
        <input type="color" id="backColor" on:change={updateBackColor} />
      </div>
    </div>
  
    <div class="group group3" class:hidden={!isExpanded}>
      <button on:click={() => execCmd('justifyLeft')} title="Canh trái">
        <span class="material-symbols-outlined">format_align_left</span>
      </button>
      <button on:click={() => execCmd('justifyCenter')} title="Canh giữa">
        <span class="material-symbols-outlined">format_align_center</span>
      </button>
      <button on:click={() => execCmd('justifyRight')} title="Canh phải">
        <span class="material-symbols-outlined">format_align_right</span>
      </button>
      <button on:click={() => execCmd('justifyFull')} title="Canh đều">
        <span class="material-symbols-outlined">format_align_justify</span>
      </button>
    </div>
  
    <div class="group group4">
      <button on:click={handleAddClick} title="Thêm mới">
        <span class="material-symbols-outlined">add</span>
      </button>
    </div>
  </div>
  
  <style>
    .container {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0.3rem;
      background: #43646D;
      position: fixed;
      top: 0.1rem;
      right: 0.1rem;
      z-index: 100;
      border-top-left-radius: 1rem;
      border-top-right-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;
      border-bottom-left-radius: 1rem;
      transition: all 0.3s ease;
    }
  
    .container:not(.expanded) {
      width: max-content;
      height: max-content;
      justify-content: center;
      padding: 0.3rem;
    }
  
    .container.expanded {
      width: max-content;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 4rem;
      padding: 0.3rem;
    }
  
    .group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
    }
  
    .hidden {
      display: none;
    }
  
    .group1 select,
    .group2 button,
    .group2 input[type="color"],
    .group3 button,
    .group4 button {
      cursor: pointer;
      background: transparent;
      border: none;
      padding: 0.5rem;
      margin: 0;
      color: #333;
      transition: background-color 0.2s, transform 0.1s;
      border-radius: 4px;
    }
  
    .group1 select:hover,
    .group2 button:hover,
    .group3 button:hover,
    .group4 button:hover {
      box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset;
      transform: scale(0.95);
      border-radius: 0.5rem;
    }
  
    #font,
    #size {
      font-size: 1rem;
      padding: .4rem .6rem;
      color: #EBE8DF;
      font-weight: bold;
      font-family: monospace;
      border-radius: 4px;
      background: #43646D;
    }
  
    #containFontColor,
    #containBackColor {
      width: 1.3rem;
      height: 1.3rem;
      background-color: rgb(255, 255, 255);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #ccc;
    }
  
    #fontColor,
    #backColor {
      width: 100%;
      height: 100%;
      opacity: 0;
      padding: 0;
      margin: 0;
      border: none;
      cursor: pointer;
    }
  
    span.material-symbols-outlined {
      font-size: 1.2rem;
      margin: 0;
      padding: 0;
      color: #EBE8DF;
    }
  </style>