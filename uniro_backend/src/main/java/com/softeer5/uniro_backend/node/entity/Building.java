package com.softeer5.uniro_backend.node.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Building {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(length = 20)
	private String phoneNumber;

	@Column(length = 100)
	private String address;

	@Column(length = 30)
	private String name;

	@Column(length = 200)
	private String imageUrl;

	private int level;

	@Column(name = "node_id")
	@NotNull
	private Long nodeId;

	@Column(name = "univ_id")
	@NotNull
	private Long univId;

}
