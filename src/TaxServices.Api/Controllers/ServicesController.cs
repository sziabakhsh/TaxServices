using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxServices.Application.DTOs.Services;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServicesController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ServiceResponse>>> GetAll()
        {
            var services = await _serviceService.GetAllAsync();

            return Ok(services);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ServiceResponse>> GetById(Guid id)
        {
            var service = await _serviceService.GetByIdAsync(id);

            if (service == null)
                return NotFound();

            return Ok(service);
        }

        [HttpPost]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<ServiceResponse>> Create(
            CreateServiceRequest request)
        {
            var service = await _serviceService.CreateAsync(request);

            return CreatedAtAction(
                nameof(GetById),
                new { id = service.Id },
                service);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<ServiceResponse>> Update(
            Guid id,
            UpdateServiceRequest request)
        {
            var service = await _serviceService.UpdateAsync(id, request);

            return Ok(service);
        }

        [HttpPatch("{id:guid}/activate")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Activate(Guid id)
        {
            await _serviceService.ActivateAsync(id);

            return NoContent();
        }

        [HttpPatch("{id:guid}/deactivate")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> Deactivate(Guid id)
        {
            await _serviceService.DeactivateAsync(id);

            return NoContent();
        }
    }
}
