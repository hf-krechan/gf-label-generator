<script>
  let selectedPart = '';
  let threadSize = '';
  let length = '';
  let standard = '';
  let material = '';
  
  const partTypes = ['Screw', 'Nut', 'Washer'];
  const threadSizes = ['M3', 'M4', 'M5', 'M6', 'M8', 'M10'];
  const standards = ['DIN 912', 'DIN 933', 'ISO 4762', 'ISO 4014'];
  const materials = ['Stainless Steel A2', 'Stainless Steel A4', 'Zinc-Plated Steel', 'Black Oxide Steel'];
</script>

<main class="container">
  <h1>Hardware Part Label Creator</h1>
  
  <div class="part-selection">
    <label for="part-type">Select Part Type:</label>
    <select id="part-type" bind:value={selectedPart}>
      <option value="">Choose a part...</option>
      {#each partTypes as part}
        <option value={part}>{part}</option>
      {/each}
    </select>
  </div>

  {#if selectedPart === 'Screw'}
    <div class="thread-selection">
      <label for="thread-size">Select Thread Size:</label>
      <select id="thread-size" bind:value={threadSize}>
        <option value="">Choose size...</option>
        {#each threadSizes as size}
          <option value={size}>{size}</option>
        {/each}
      </select>
    </div>

    <div class="standard-selection">
      <label for="standard">Select Standard:</label>
      <select id="standard" bind:value={standard}>
        <option value="">Choose standard...</option>
        {#each standards as std}
          <option value={std}>{std}</option>
        {/each}
      </select>
    </div>

    <div class="material-selection">
      <label for="material">Select Material:</label>
      <select id="material" bind:value={material}>
        <option value="">Choose material...</option>
        {#each materials as mat}
          <option value={mat}>{mat}</option>
        {/each}
      </select>
    </div>

    <div class="length-input">
      <label for="length">Screw Length (mm):</label>
      <input 
        id="length"
        type="number"
        min="1"
        bind:value={length}
        placeholder="Enter length in mm"
      />
    </div>
  {/if}

  {#if selectedPart}
    <div class="preview">
      <h2>Label Preview:</h2>
      <div class="label">
        <p>{selectedPart}</p>
        {#if selectedPart === 'Screw'}
          {#if threadSize}
            <p>Thread: {threadSize}</p>
          {/if}
          {#if length}
            <p>Length: {length}mm</p>
          {/if}
          {#if standard}
            <p>Standard: {standard}</p>
          {/if}
          {#if material}
            <p>Material: {material}</p>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</main>

<style>
  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }

  .part-selection, .thread-selection, .standard-selection, .material-selection {
    margin: 1rem 0;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
  }

  select {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
  }

  .preview {
    margin-top: 2rem;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .label {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
  }

  .label p {
    margin: 0.5rem 0;
  }

  .length-input {
    margin: 1rem 0;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
</style>
