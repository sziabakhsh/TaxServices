using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaxServices.Application.DTOs.Employees;
using TaxServices.Application.Interfaces;

namespace TaxServices.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeesController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<IReadOnlyList<EmployeeDto>>> GetAll(CancellationToken cancellationToken)
        {
            var employees = await _employeeService.GetAllAsync(cancellationToken);

            return Ok(employees);
        }

        [HttpGet("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<EmployeeDto>> GetById(Guid id, CancellationToken cancellationToken)
        {
            var employee = await _employeeService.GetByIdAsync(id, cancellationToken);

            if (employee is null)
                return NotFound();

            return Ok(employee);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EmployeeCreatedResponse>> Create([FromBody] CreateEmployeeRequest request, CancellationToken cancellationToken)
        {
            var response = await _employeeService.CreateAsync(request, cancellationToken);

            return CreatedAtAction(nameof(GetById), new { id = response.Employee.Id }, response);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<ActionResult<EmployeeDto>> Update(Guid id, [FromBody] UpdateEmployeeRequest request, CancellationToken cancellationToken)
        {
            var employee = await _employeeService.UpdateAsync(id, request, cancellationToken);

            if (employee is null)
                return NotFound();

            return Ok(employee);
        }

        [HttpPatch("{id:guid}/activate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Activate(
            Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _employeeService.ActivateAsync(
                id,
                cancellationToken);

            if (!result)
                return NotFound();

            return NoContent();
        }

        [HttpPatch("{id:guid}/deactivate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Deactivate(
            Guid id,
            CancellationToken cancellationToken)
        {
            var result = await _employeeService.DeactivateAsync(
                id,
                cancellationToken);

            if (!result)
                return NotFound();

            return NoContent();
        }
    }
}