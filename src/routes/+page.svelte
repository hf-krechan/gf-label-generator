<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  let selectedPart = '';
  let threadSize = '';
  let length = '';
  let standard = '';
  let material = '';
  
  const partTypes = ['Screw', 'Nut', 'Washer'];
  const threadSizes = ['M3', 'M4', 'M5', 'M6', 'M8', 'M10'];
  const standards = ['DIN 912', 'DIN 933', 'ISO 4762', 'ISO 4014'];
  const materials = ['Stainless Steel A2', 'Stainless Steel A4', 'Zinc-Plated Steel', 'Black Oxide Steel'];

  let showPreview = false;

  // Add this reactive statement
  $: showPreview = selectedPart === 'Screw' && 
                   Boolean(threadSize) && 
                   Boolean(length) && 
                   Boolean(standard) && 
                   Boolean(material);

  // Load saved data on component mount
  onMount(() => {
    if (browser) {
      const savedData = localStorage.getItem('partLabelData');
      if (savedData) {
        const data = JSON.parse(savedData);
        selectedPart = data.selectedPart;
        threadSize = data.threadSize;
        length = data.length;
        standard = data.standard;
        material = data.material;
      }
    }
  });

  // Save data whenever any value changes
  $: {
    if (browser) {
      const data = { selectedPart, threadSize, length, standard, material };
      localStorage.setItem('partLabelData', JSON.stringify(data));
    }
  }

  // Function to generate the label text (e.g., "M6x25")
  function getLabelText() {
    if (selectedPart === 'Screw' && threadSize && length) {
      return `${threadSize}x${length}`;
    }
    return '';
  }

  // Function to get material text in German format
  function getMaterialText() {
    if (material === 'Zinc-Plated Steel') return 'Stahl vz';
    // Add other material translations as needed
    return material;
  }

  // Function to get the correct SVG path based on the standard
  function getScrewImagePath(standard: string): string {
    const standardLower = standard.toLowerCase().replace(' ', '');
    return `/images/screws/${standardLower}.svg`;
  }

  async function downloadSVG() {
    const svgElement = document.querySelector('.svg-preview svg');
    if (!svgElement) return;
    
    // Create clone and set original dimensions for download
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.setAttribute('width', '35mm');
    svgClone.setAttribute('height', '12mm');
    
    // Fetch and convert screw image to base64
    const screwResponse = await fetch(getScrewImagePath(standard));
    const screwBlob = await screwResponse.blob();
    const screwBase64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(screwBlob);
    });

    // Create a clone of the SVG and update the image href
    const imageElement = svgClone.querySelector('image');
    if (imageElement) {
      imageElement.setAttribute('href', screwBase64 as string);
    }
    
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgClone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${threadSize}x${length}_${standard}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
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

  {#if showPreview}
    <div class="svg-preview">
      <svg 
        width="140mm" 
        height="48mm" 
        viewBox="0 0 350 120" 
        preserveAspectRatio="xMidYMid meet"
        class="preview-svg"
      >
        <!-- Background -->
        <rect width="350" height="120" fill="#E0E0E0"/>
        
        <!-- Screw image -->
        <image 
          x="15" 
          y="14"
          width="90"
          height="60"
          href={getScrewImagePath(standard)}
        />

        <!-- Standard (DIN) in black box -->
        <g transform="translate(300,0)">
          <rect width="30" height="120" fill="black"/>
          <text 
            x="15" 
            y="60" 
            font-size="13" 
            font-weight="bold" 
            fill="white" 
            text-anchor="middle"
            dominant-baseline="middle"
            transform="rotate(-90, 15, 60)"
            font-family="Verdana"
          >{standard}</text>
        </g>

        <!-- Text elements -->
        <text 
          x="280" 
          y="40" 
          font-size="35" 
          font-weight="bold" 
          font-family="Verdana"
          text-anchor="end"
        >{getLabelText()}</text>
        <text 
          x="280" 
          y="70" 
          font-size="12" 
          font-family="Verdana"
          text-anchor="end"
        >{getMaterialText()}</text>
      </svg>
      <button class="download-button" on:click={downloadSVG}>
        Download SVG
      </button>
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

  .svg-preview {
    margin-top: 2rem;
    border: 1px solid #ccc;
    padding: 1rem;
    background: white;
  }

  .preview-svg {
    width: 140mm;
    height: 48mm;
  }

  svg {
    width: 35mm;
    height: 12mm;
  }

  .download-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .download-button:hover {
    background-color: #45a049;
  }
</style>
