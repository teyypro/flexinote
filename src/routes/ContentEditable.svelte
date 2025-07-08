<script>
    import { createEventDispatcher, onMount } from 'svelte';
  
    export let id;
    export let content = '';
  
    const dispatch = createEventDispatcher();
  
    let element;
  
    function handleInput() {
      content = element.innerHTML;
      dispatch('contentChange', content);
    }
  
    onMount(() => {
      if (element) {
        element.innerHTML = content;
      }
      return () => {
        element = null;
      };
    });
  </script>
  
  <div class="editor" spellcheck="false"
    {id}
    bind:this={element}
    contenteditable="true"
    on:input={handleInput}
  />
  
  <style>
 .editor {
    display: inline-block;
    padding: .5rem;
    min-width: 50%;
    max-height: 80vh;
    height: max-content;
    width: max-content;
    max-width: 96%;
    background: #fff;
    overflow: auto;
    word-wrap: break-word;
    border-left: 2px solid #43646d;
    width: 96%;
    transition: 0.1s ease;
  }

  .editor:hover, .editor:focus-visible, .editor:focus{
    outline: 0;
    border: 0;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
    border-radius: 0.5rem;
  }
  </style>