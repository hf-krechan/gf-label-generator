<script>
  let selectedType = "";

  const hardwareTypes = [
    { id: "screw", label: "Screw" },
    { id: "nut", label: "Nut" },
    { id: "washer", label: "Washer" },
  ];
</script>

<main class="container">
  <h1>Hardware Label Generator</h1>

  <div class="selection-card">
    <h2>Select Hardware Type</h2>
    <div class="hardware-options">
      {#each hardwareTypes as type}
        <button
          class:active={selectedType === type.id}
          on:click={() => (selectedType = type.id)}
        >
          {type.label}
        </button>
      {/each}
    </div>
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    text-align: center;
    color: #2c3e50;
    margin-bottom: 2rem;
  }

  .selection-card {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  h2 {
    color: #34495e;
    margin-bottom: 1.5rem;
  }

  .hardware-options {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  button {
    padding: 1rem 2rem;
    border: 2px solid #3498db;
    background: white;
    color: #3498db;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1.1rem;
    transition: all 0.3s ease;
  }

  button:hover {
    background: #3498db;
    color: white;
  }

  button.active {
    background: #3498db;
    color: white;
  }
</style>
