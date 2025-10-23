// API service for music generation
const API_BASE_URL = '/api' // Используем прокси вместо прямого обращения к localhost:8000

class MusicGenerationAPI {
  /**
   * Generate music track
   * @param {string} prompt - Text prompt for music generation
   * @param {number} duration - Duration in seconds (default: 15)
   * @param {string} format - Audio format ('wav' or 'mp3', default: 'wav')
   * @returns {Promise<{job_id: string, status_url: string, download_url: string}>}
   */
  async generateMusic(prompt, duration = 15, format = 'wav') {
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          duration,
          format
        })
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Очередь заполнена. Попробуйте позже.')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error generating music:', error)
      throw error
    }
  }

  /**
   * Check generation status
   * @param {string} jobId - Job ID from generation request
   * @returns {Promise<{job_id: string, status: string, error: string|null, output_path: string|null, device: string}>}
   */
  async checkStatus(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/status/${jobId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Задание не найдено')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error checking status:', error)
      throw error
    }
  }

  /**
   * Download generated file
   * @param {string} jobId - Job ID from generation request
   * @returns {Promise<Blob>}
   */
  async downloadFile(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${jobId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      return blob
    } catch (error) {
      console.error('Error downloading file:', error)
      throw error
    }
  }

  /**
   * Get API info
   * @returns {Promise<{name: string, device: string, endpoints: string[]}>}
   */
  async getApiInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting API info:', error)
      throw error
    }
  }

  /**
   * Poll status until completion
   * @param {string} jobId - Job ID to poll
   * @param {function} onStatusUpdate - Callback for status updates
   * @param {number} pollInterval - Polling interval in ms (default: 2000)
   * @returns {Promise<{job_id: string, status: string, error: string|null, output_path: string|null}>}
   */
  async pollUntilComplete(jobId, onStatusUpdate = null, pollInterval = 2000) {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const status = await this.checkStatus(jobId)
          
          if (onStatusUpdate) {
            onStatusUpdate(status)
          }

          if (status.status === 'done') {
            resolve(status)
          } else if (status.status === 'error') {
            reject(new Error(status.error || 'Ошибка генерации'))
          } else {
            // Continue polling for 'queued' or 'processing' status
            setTimeout(poll, pollInterval)
          }
        } catch (error) {
          reject(error)
        }
      }

      poll()
    })
  }
}

// Export singleton instance
export const musicApi = new MusicGenerationAPI()
export default musicApi